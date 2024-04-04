import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { assert } from 'src/utils/assert';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';

export class UserService extends TypeOrmQueryService<User> {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
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

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        user.defaultWorkspace.id,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "userId" = '${userId}'`,
    );

    await this.userWorkspaceRepository.delete({ userId });

    await this.userRepository.delete(user.id);

    return user;
  }

  async handleRemoveWorkspaceMember(workspaceId: string, userId: string) {
    await this.userWorkspaceRepository.delete({
      userId,
      workspaceId,
    });
    await this.reassignOrRemoveUserDefaultWorkspace(workspaceId, userId);
  }

  private async reassignOrRemoveUserDefaultWorkspace(
    workspaceId: string,
    userId: string,
  ) {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId: userId },
    });

    if (userWorkspaces.length === 0) {
      await this.userRepository.delete({ id: userId });

      return;
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error(`User ${userId} not found in workspace ${workspaceId}`);
    }

    if (user.defaultWorkspaceId === workspaceId) {
      await this.userRepository.update(
        { id: userId },
        {
          defaultWorkspaceId: userWorkspaces[0].workspaceId,
        },
      );
    }
  }
}
