import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:delete-file-records',
  description: 'Delete all file records from FileRepository for workspace',
})
export class DeleteFileRecordsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(DeleteFileRecordsCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting deletion of file records for workspace ${workspaceId}`,
    );

    const files = await this.fileRepository.find({
      where: { workspaceId },
      withDeleted: true,
    });

    if (files.length === 0) {
      this.logger.log(
        `No file records found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would delete' : 'Deleting'} ${files.length} file record(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    try {
      await this.fileRepository.delete({ workspaceId });

      this.logger.log(
        `Successfully deleted ${files.length} file record(s) for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to delete file records for workspace ${workspaceId}: ${error.message}`,
      );

      throw error;
    }
  }
}
