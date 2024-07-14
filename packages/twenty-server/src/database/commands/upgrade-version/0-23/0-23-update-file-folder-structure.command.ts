import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DataSource, Like, Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceCacheVersionService } from 'src/engine/metadata-modules/workspace-cache-version/workspace-cache-version.service';

interface UpdateFileFolderStructureCommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0-23:update-file-folder-structure',
  description: 'Update file folder structure (prefixed per workspace)',
})
export class UpdateFileFolderStructureCommand extends CommandRunner {
  private readonly logger = new Logger(UpdateFileFolderStructureCommand.name);
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly typeORMService: TypeORMService,
    private readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheVersionService: WorkspaceCacheVersionService,
    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,
  ) {
    super();
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id. Command runs on all workspaces if not provided',
    required: false,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async run(
    _passedParam: string[],
    options: UpdateFileFolderStructureCommandOptions,
  ): Promise<void> {
    const workspaceIds = options.workspaceId
      ? [options.workspaceId]
      : (await this.workspaceRepository.find()).map(
          (workspace) => workspace.id,
        );

    if (!workspaceIds.length) {
      this.logger.log(chalk.yellow('No workspace found'));

      return;
    }

    this.logger.log(
      chalk.green(`Running command on ${workspaceIds.length} workspaces`),
    );

    for (const workspaceId of workspaceIds) {
      const dataSourceMetadata =
        await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceId(
          workspaceId,
        );

      if (!dataSourceMetadata) {
        this.logger.log(
          `Could not find dataSourceMetadata for workspace ${workspaceId}`,
        );
        continue;
      }

      const workspaceDataSource =
        await this.typeORMService.connectToDataSource(dataSourceMetadata);

      if (!workspaceDataSource) {
        throw new Error(
          `Could not connect to dataSource for workspace ${workspaceId}`,
        );
      }

      const workspaceQueryRunner = workspaceDataSource.createQueryRunner();

      const attachmentsToMove = (await workspaceQueryRunner.query(
        `SELECT id, "fullPath" FROM "${dataSourceMetadata.schema}"."attachment" WHERE "fullPath" LIKE '${FileFolder.Attachment}/%'`,
      )) as { id: string; fullPath: string }[];

      const workspaceMemberAvatarsToMove = (await workspaceQueryRunner.query(
        `SELECT id, "avatarUrl" FROM "${dataSourceMetadata.schema}"."workspaceMember" WHERE "avatarUrl" LIKE '${FileFolder.ProfilePicture}/%'`,
      )) as { id: string; avatarUrl: string }[];

      const personAvatarsToMove = (await workspaceQueryRunner.query(
        `SELECT id, "avatarUrl" FROM "${dataSourceMetadata.schema}"."person" WHERE "avatarUrl" LIKE '${FileFolder.PersonPicture}/%'`,
      )) as { id: string; avatarUrl: string }[];

      const workspacePictureToMove = await this.workspaceRepository.findOneBy({
        id: workspaceId,
        logo: Like(`${FileFolder.WorkspaceLogo}/%`),
      });

      this.logger.log({
        workspacePictureToMove,
        attachmentsToMove,
        workspaceMemberAvatarsToMove,
        personAvatarsToMove,
      });

      // TODO: move files and update paths

      this.logger.log(
        chalk.green(`Running command on workspace ${workspaceId} done`),
      );
    }

    this.logger.log(chalk.green(`Command completed!`));
  }
}
