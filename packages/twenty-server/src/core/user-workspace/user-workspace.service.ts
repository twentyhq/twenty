import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { UserWorkspace } from 'src/core/user-workspace/user-workspace.entity';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { User } from 'src/core/user/user.entity';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';

export class UserWorkspaceService extends TypeOrmQueryService<UserWorkspace> {
  constructor(
    @InjectRepository(UserWorkspace, 'core')
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
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

  async findUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
    return this.userWorkspaceRepository.find({
      where: {
        userId,
      },
    });
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
