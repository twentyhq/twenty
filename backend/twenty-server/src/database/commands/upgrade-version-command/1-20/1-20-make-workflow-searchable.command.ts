import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-20:make-workflow-searchable',
  description: 'Set isSearchable to true on the workflow object metadata',
})
export class MakeWorkflowSearchableCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would set isSearchable=true on workflow object for workspace ${workspaceId}. Skipping.`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const result = await queryRunner.query(
        `UPDATE core."objectMetadata"
         SET "isSearchable" = true
         WHERE "workspaceId" = $1
           AND "nameSingular" = 'workflow'
           AND "isSearchable" = false`,
        [workspaceId],
      );

      const updatedCount = result?.[1] ?? 0;

      if (updatedCount > 0) {
        this.logger.log(
          `Set isSearchable=true on workflow object for workspace ${workspaceId}`,
        );

        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'flatObjectMetadataMaps',
        ]);

        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );

        await this.workspaceCacheStorageService.flush(workspaceId);
      } else {
        this.logger.log(
          `Workflow already searchable or not found for workspace ${workspaceId}, skipping`,
        );
      }
    } finally {
      await queryRunner.release();
    }
  }
}
