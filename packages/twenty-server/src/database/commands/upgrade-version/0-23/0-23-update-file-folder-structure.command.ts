import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import { Like, Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FileStorageService } from 'src/engine/integrations/file-storage/file-storage.service';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';

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
    private readonly fileStorageService: FileStorageService,
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
        `SELECT id, "avatarUrl" as "fullPath" FROM "${dataSourceMetadata.schema}"."workspaceMember" WHERE "avatarUrl" LIKE '${FileFolder.ProfilePicture}/%'`,
      )) as { id: string; fullPath: string }[];

      const personAvatarsToMove = (await workspaceQueryRunner.query(
        `SELECT id, "avatarUrl" as "fullPath" FROM "${dataSourceMetadata.schema}"."person" WHERE "avatarUrl" LIKE '${FileFolder.PersonPicture}/%'`,
      )) as { id: string; fullPath: string }[];

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

      try {
        const updatedAttachments = await this.moveFiles(
          workspaceId,
          attachmentsToMove,
        );

        await workspaceQueryRunner.query(
          `UPDATE "${dataSourceMetadata.schema}"."attachment" SET "fullPath" = REPLACE("fullPath", '${FileFolder.Attachment}', 'workspace-${workspaceId}/${FileFolder.Attachment}')`,
        );

        this.logger.log(
          chalk.green(
            `Updated ${updatedAttachments.length} attachments in workspace ${workspaceId}`,
          ),
        );
      } catch (e) {
        this.logger.error(e);
      }

      try {
        const updatedWorkspaceMemberAvatars = await this.moveFiles(
          workspaceId,
          workspaceMemberAvatarsToMove,
        );

        await workspaceQueryRunner.query(
          `UPDATE "${dataSourceMetadata.schema}"."workspaceMember" SET "avatarUrl" = REPLACE("avatarUrl", '${FileFolder.ProfilePicture}', 'workspace-${workspaceId}/${FileFolder.ProfilePicture}')`,
        );

        this.logger.log(
          chalk.green(
            `Updated ${updatedWorkspaceMemberAvatars.length} workspaceMemberAvatars in workspace ${workspaceId}`,
          ),
        );
      } catch (e) {
        this.logger.error(e);
      }

      try {
        const updatedPersonAvatars = await this.moveFiles(
          workspaceId,
          personAvatarsToMove,
        );

        await workspaceQueryRunner.query(
          `UPDATE "${dataSourceMetadata.schema}"."person" SET "avatarUrl" = REPLACE("avatarUrl", '${FileFolder.PersonPicture}', 'workspace-${workspaceId}/${FileFolder.PersonPicture}')`,
        );

        this.logger.log(
          chalk.green(
            `Updated ${updatedPersonAvatars.length} personAvatars in workspace ${workspaceId}`,
          ),
        );
      } catch (e) {
        this.logger.error(e);
      }

      if (workspacePictureToMove?.logo) {
        await this.moveFiles(workspaceId, [
          {
            id: workspacePictureToMove.id,
            fullPath: workspacePictureToMove.logo,
          },
        ]);
        await this.workspaceRepository.update(
          {
            id: workspaceId,
          },
          {
            logo: `workspace-${workspaceId}/${FileFolder.WorkspaceLogo}/${workspacePictureToMove.id}`,
          },
        );

        this.logger.log(
          chalk.green(`Updated workspacePicture in workspace ${workspaceId}`),
        );
      }

      this.logger.log(
        chalk.green(`Running command on workspace ${workspaceId} done`),
      );
    }

    this.logger.log(chalk.green(`Command completed!`));
  }

  private async moveFiles(
    workspaceId: string,
    filesToMove: { id: string; fullPath: string }[],
  ) {
    return await Promise.all(
      filesToMove.map(async (file) => {
        const { id, fullPath } = file;
        const pathParts = fullPath.split('/');
        const filename = pathParts.pop();
        const originalFolderPath = pathParts.join('/');
        const updatedFolderPath = `workspace-${workspaceId}/${originalFolderPath}`;

        if (!filename) {
          throw new Error(`Filename is empty`);
        }

        await this.fileStorageService.move({
          from: {
            folderPath: originalFolderPath,
            filename: filename,
          },
          to: {
            folderPath: updatedFolderPath,
            filename: filename,
          },
        });

        return {
          id,
          updatedFolderPath,
        };
      }),
    );
  }
}
