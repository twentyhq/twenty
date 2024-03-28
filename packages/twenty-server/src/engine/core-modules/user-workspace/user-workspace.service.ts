import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecordCreateEvent } from 'src/engine/integrations/event-emitter/types/object-record-create.event';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { assert } from 'src/utils/assert';

export class UserWorkspaceService extends TypeOrmQueryService<UserWorkspace> {
  constructor(
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private eventEmitter: EventEmitter2,
  ) {
    super(userWorkspaceRepository);
  }

  async create(userId: string, workspaceId: string): Promise<UserWorkspace> {
    const userWorkspace = this.userWorkspaceRepository.create({
      userId,
      workspaceId,
    });

    return this.userWorkspaceRepository.save(userWorkspace);
  }

  async createWorkspaceMember(workspaceId: string, user: User) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."workspaceMember"
        ("nameFirstName", "nameLastName", "colorScheme", "userId", "userEmail", "avatarUrl")
        VALUES ('${user.firstName}', '${user.lastName}', 'Light', '${
          user.id
        }', '${user.email}', '${user.defaultAvatarUrl ?? ''}')`,
    );
    const workspaceMember = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "userId"='${user.id}'`,
    );

    assert(
      workspaceMember.length === 1,
      `Error while creating workspace member ${user.email} on workspace ${workspaceId}`,
    );
    const payload =
      new ObjectRecordCreateEvent<WorkspaceMemberObjectMetadata>();

    payload.workspaceId = workspaceId;
    payload.details = {
      after: workspaceMember[0],
    };
    payload.recordId = workspaceMember[0].id;

    this.eventEmitter.emit('workspaceMember.created', payload);
  }

  public async getWorkspaceMemberCount(workspaceId: string): Promise<number> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return (
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember"`,
        [],
        workspaceId,
      )
    ).length;
  }

  async checkUserWorkspaceExists(
    userId: string,
    workspaceId: string,
  ): Promise<UserWorkspace | null> {
    return this.userWorkspaceRepository.findOneBy({
      userId,
      workspaceId,
    });
  }
}
