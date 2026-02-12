import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { updateFileTableQueries } from 'src/database/typeorm/core/migrations/utils/1768572831179-updateFileTable.util';
import { FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

@Command({
  name: 'upgrade:delete-file-records-and-update-table',
  description: 'Delete all file records and update file table schema',
})
export class DeleteFileRecordsAndUpdateTableCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    DeleteFileRecordsAndUpdateTableCommand.name,
  );
  private hasRunOnce = false;

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      return;
    }

    await this.deleteFileRecords(args);
    await this.updateFileTable();
    await this.addFileEntityUniqueConstraint(args);
    this.hasRunOnce = true;
  }

  private async updateFileTable(): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await updateFileTableQueries(queryRunner);

      await queryRunner.commitTransaction();
      this.logger.log('Successfully updated file table');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Rolling back updateFileTable: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private async deleteFileRecords({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting deletion of file records for workspace ${workspaceId}`,
    );

    const files = await this.fileRepository.find({
      select: ['id'],
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

  private async addFileEntityUniqueConstraint({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(
        `ALTER TABLE "core"."file" ADD CONSTRAINT "IDX_APPLICATION_PATH_WORKSPACE_ID_APPLICATION_ID_UNIQUE" UNIQUE ("workspaceId", "applicationId", "path")`,
      );

      await queryRunner.commitTransaction();
      this.logger.log('Successfully added file entity unique constraint');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back addFileEntityUniqueConstraint: ${error.message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
