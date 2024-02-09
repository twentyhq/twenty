import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { assert } from 'src/utils/assert';
import { User } from 'src/core/user/user.entity';
import { WorkspaceMember } from 'src/core/user/dtos/workspace-member.dto';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';

export class UserService extends TypeOrmQueryService<User> {
  constructor(
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
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

    assert(workspaceMembers.length === 1, 'WorkspaceMember not found');

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

  async createWorkspaceMember(user: User) {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        user.defaultWorkspace.id,
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
  }

  async deleteUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    assert(user, 'User not found');

    await this.userRepository.delete(user.id);

    return user;
  }
}
