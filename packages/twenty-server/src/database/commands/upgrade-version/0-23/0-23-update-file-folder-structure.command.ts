import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command, CommandRunner, Option } from 'nest-commander';
import pLimit from 'p-limit';
import { Like, Repository } from 'typeorm';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/integrations/file-storage/interfaces/file-storage-exception';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import {
  Workspace,
  WorkspaceActivationStatus,
} from 'src/engine/core-modules/workspace/workspace.entity';
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
      : (
          await this.workspaceRepository.find({
            where: { activationStatus: WorkspaceActivationStatus.ACTIVE },
          })
        ).map((workspace) => workspace.id);

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

      try {
        const updatedAttachments = await this.moveFiles(
          workspaceId,
          attachmentsToMove,
        );

        this.logger.log(
          chalk.green(
            `Moved ${updatedAttachments.length} attachments in workspace ${workspaceId}`,
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

        this.logger.log(
          chalk.green(
            `Moved ${updatedWorkspaceMemberAvatars.length} workspaceMemberAvatars in workspace ${workspaceId}`,
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

        this.logger.log(
          chalk.green(
            `Moved ${updatedPersonAvatars.length} personAvatars in workspace ${workspaceId}`,
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

        this.logger.log(
          chalk.green(`Moved workspacePicture in workspace ${workspaceId}`),
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
  ): Promise<Array<{ id: string; updatedFolderPath: string }>> {
    const batchSize = 20;
    const limit = pLimit(batchSize);

    const moveFile = async ({
      id,
      fullPath,
    }: {
      id: string;
      fullPath: string;
    }) => {
      const pathParts = fullPath.split('/');
      const filename = pathParts.pop();

      if (!filename) {
        throw new Error(`Filename is empty for file ID: ${id}`);
      }

      const originalFolderPath = pathParts.join('/');
      const updatedFolderPath = `workspace-${workspaceId}/${originalFolderPath}`;

      try {
        await this.fileStorageService.move({
          from: { folderPath: originalFolderPath, filename },
          to: { folderPath: updatedFolderPath, filename },
        });
      } catch (error) {
        if (
          error instanceof FileStorageException &&
          error.code === FileStorageExceptionCode.FILE_NOT_FOUND
        ) {
          this.logger.error(`File not found: ${fullPath}`);
        } else {
          this.logger.error(`Error moving file ${fullPath}: ${error}`);
        }

        return;
      }

      return { id, updatedFolderPath };
    };

    const movePromises = filesToMove.map((file) => limit(() => moveFile(file)));

    const results = await Promise.all(movePromises);

    return results.filter(
      (result): result is { id: string; updatedFolderPath: string } =>
        Boolean(result),
    );
  }
}
