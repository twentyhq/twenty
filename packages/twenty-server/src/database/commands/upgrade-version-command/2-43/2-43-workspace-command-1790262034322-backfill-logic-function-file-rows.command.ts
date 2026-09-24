import chunk from 'lodash.chunk';
import { Command } from 'nest-commander';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Like } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  findLogicFunctionFilesWithoutFileRow,
  type LogicFunctionFileWithoutFileRow,
} from 'src/database/commands/upgrade-version-command/2-43/utils/find-logic-function-files-without-file-row.util';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { FILE_STATUS } from 'src/engine/core-modules/file/types/file-status.types';
import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const STORAGE_LOOKUP_BATCH_SIZE = 20;
const FILE_ROW_INSERT_BATCH_SIZE = 500;

type StoredLogicFunctionFile = LogicFunctionFileWithoutFileRow & {
  size: number;
};

@RegisteredWorkspaceCommand('2.43.0', 1790262034322)
@Command({
  name: 'upgrade:2-43:backfill-logic-function-file-rows',
  description:
    'Create the missing file rows of logic function source and built files, which workflow code step duplication requires',
})
export class BackfillLogicFunctionFileRowsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
    @InjectWorkspaceScopedRepository(FileEntity)
    private readonly fileRepository: WorkspaceScopedRepository<FileEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatLogicFunctionMaps, flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatLogicFunctionMaps',
        'flatApplicationMaps',
      ]);

    const flatLogicFunctions = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    );

    if (flatLogicFunctions.length === 0) {
      return;
    }

    const existingFileRows = await this.fileRepository.find(workspaceId, {
      select: { applicationId: true, path: true },
      where: [
        { path: Like(`${FileFolder.Source}/%`) },
        { path: Like(`${FileFolder.BuiltLogicFunction}/%`) },
      ],
      withDeleted: true,
    });

    const filesWithoutFileRow = findLogicFunctionFilesWithoutFileRow({
      flatLogicFunctions,
      flatApplicationMaps,
      existingFileRows,
    });

    if (filesWithoutFileRow.length === 0) {
      return;
    }

    const storedFiles = await this.findStoredFiles({
      workspaceId,
      files: filesWithoutFileRow,
    });

    const missingFromStorageCount =
      filesWithoutFileRow.length - storedFiles.length;

    if (missingFromStorageCount > 0) {
      this.logger.warn(
        `Skipping ${missingFromStorageCount} logic function file(s) missing from storage for workspace ${workspaceId}`,
      );
    }

    if (storedFiles.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would backfill ${storedFiles.length} logic function file row(s) for workspace ${workspaceId}`,
      );

      return;
    }

    await this.insertFileRows({ workspaceId, storedFiles });

    // The storage stock counters only track writes made through
    // FileStorageService, so drop them to re-warm from the backfilled rows.
    const applicationIds = new Set(
      storedFiles.map(({ applicationId }) => applicationId),
    );

    for (const applicationId of applicationIds) {
      await this.fileStorageService.invalidateStorageStock({
        workspaceId,
        applicationId,
      });
    }

    this.logger.log(
      `Backfilled ${storedFiles.length} logic function file row(s) for workspace ${workspaceId}`,
    );
  }

  private async findStoredFiles({
    workspaceId,
    files,
  }: {
    workspaceId: string;
    files: LogicFunctionFileWithoutFileRow[];
  }): Promise<StoredLogicFunctionFile[]> {
    const storedFiles: StoredLogicFunctionFile[] = [];

    for (const batch of chunk(files, STORAGE_LOOKUP_BATCH_SIZE)) {
      const fileMetadatas = await Promise.all(
        batch.map((file) =>
          this.fileStorageService.getFileMetadata({
            workspaceId,
            applicationUniversalIdentifier: file.applicationUniversalIdentifier,
            fileFolder: file.fileFolder,
            resourcePath: file.resourcePath,
          }),
        ),
      );

      batch.forEach((file, index) => {
        const fileMetadata = fileMetadatas[index];

        if (isDefined(fileMetadata)) {
          storedFiles.push({ ...file, size: fileMetadata.size });
        }
      });
    }

    return storedFiles;
  }

  private async insertFileRows({
    workspaceId,
    storedFiles,
  }: {
    workspaceId: string;
    storedFiles: StoredLogicFunctionFile[];
  }): Promise<void> {
    for (const batch of chunk(storedFiles, FILE_ROW_INSERT_BATCH_SIZE)) {
      const fileRows = await Promise.all(
        batch.map(async ({ applicationId, path, resourcePath, size }) => {
          // Logic function files are text, which file-type never sniffs, so
          // the extension alone decides the mime type writeFile would store.
          const { mimeType } = await extractFileInfoOrThrow({
            file: Buffer.alloc(0),
            filename: resourcePath,
          });

          return {
            workspaceId,
            applicationId,
            path,
            size,
            mimeType,
            status: FILE_STATUS.UPLOADED,
            settings: { isTemporaryFile: false, toDelete: false },
          };
        }),
      );

      await this.fileRepository
        .createQueryBuilder()
        .insert()
        .values(fileRows)
        .orIgnore()
        .execute();
    }
  }
}
