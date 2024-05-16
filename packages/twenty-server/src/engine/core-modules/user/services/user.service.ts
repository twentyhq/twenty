import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { assert } from 'src/utils/assert';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { ObjectRecordDeleteEvent } from 'src/engine/integrations/event-emitter/types/object-record-delete.event';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';

export class UserService extends TypeOrmQueryService<User> {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly eventEmitter: EventEmitter2,
    private readonly workspaceService: WorkspaceService,
  ) {
    super(userRepository);
  }

  async loadWorkspaceMember(user: User) {
    const dataSourcesMetadata =
      await this.dataSourceService.getDataSourcesMetadataFromWorkspaceId(
        user.defaultWorkspace.id,
      );

    if (!dataSourcesMetadata.length) {
      return;
    }

    if (dataSourcesMetadata.length > 1) {
      throw new Error(
        `user '${user.id}' default workspace '${user.defaultWorkspace.id}' has multiple data source metadata`,
      );
    }

    const dataSourceMetadata = dataSourcesMetadata[0];

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const workspaceMembers = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "userId" = '${user.id}'`,
    );

    if (!workspaceMembers.length) {
      return;
    }

    assert(
      workspaceMembers.length === 1,
      'WorkspaceMember not found or too many found',
    );

    const userWorkspaceMember = new WorkspaceMember();

    userWorkspaceMember.id = workspaceMembers[0].id;
    userWorkspaceMember.colorScheme = workspaceMembers[0].colorScheme;
    userWorkspaceMember.locale = workspaceMembers[0].locale;
    userWorkspaceMember.avatarUrl = workspaceMembers[0].avatarUrl;
    userWorkspaceMember.name = {
      firstName: workspaceMembers[0].nameFirstName,
      lastName: workspaceMembers[0].nameLastName,
    };

    return userWorkspaceMember;
  }

  async loadWorkspaceMembers(dataSource: DataSourceEntity) {
    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSource);

    return await workspaceDataSource?.query(
      `
      SELECT * 
      FROM ${dataSource.schema}."workspaceMember" AS s 
      INNER JOIN core.user AS u 
      ON s."userId" = u.id
    `,
    );
  }

  async deleteUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: ['defaultWorkspace'],
    });

    assert(user, 'User not found');

    const workspaceId = user.defaultWorkspaceId;

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    const workspaceMembers = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember"`,
    );
    const workspaceMember = workspaceMembers.filter(
      (member: ObjectRecord<WorkspaceMemberWorkspaceEntity>) =>
        member.userId === userId,
    )?.[0];

    assert(workspaceMember, 'WorkspaceMember not found');

    if (workspaceMembers.length === 1) {
      await this.workspaceService.deleteWorkspace(workspaceId);

      return user;
    }

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "userId" = '${userId}'`,
    );
    const payload =
      new ObjectRecordDeleteEvent<WorkspaceMemberWorkspaceEntity>();

    payload.workspaceId = workspaceId;
    payload.properties = {
      before: workspaceMember,
    };
    payload.recordId = workspaceMember.id;

    this.eventEmitter.emit('workspaceMember.deleted', payload);

    return user;
  }
}
