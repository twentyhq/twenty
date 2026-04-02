import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Command({
  name: 'upgrade:1-20:make-workflow-searchable',
  description: 'Set isSearchable to true on the workflow object metadata',
})
export class MakeWorkflowSearchableCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceIteratorService);
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
