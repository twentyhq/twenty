import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeFieldMetadataLayoutBackfillFromIndexViews } from 'src/database/commands/upgrade-version-command/2-35/utils/compute-field-metadata-layout-backfill-from-index-views.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.35.0', 1787735726000)
@Command({
  name: 'upgrade:2-35:backfill-field-metadata-layout-from-index-views',
  description:
    'Seed fieldMetadata position and isVisibleByDefault from each object index view fields',
})
export class BackfillFieldMetadataLayoutFromIndexViewsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatViewMaps, flatViewFieldMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatViewFieldMaps',
        'flatFieldMetadataMaps',
      ]);

    const { flatFieldMetadatasToUpdate } =
      computeFieldMetadataLayoutBackfillFromIndexViews({
        flatViewMaps,
        flatViewFieldMaps,
        flatFieldMetadataMaps,
        now: new Date().toISOString(),
      });

    if (flatFieldMetadatasToUpdate.length === 0) {
      this.logger.log(
        `Field metadata layout already backfilled for workspace ${workspaceId}`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would backfill layout for ${flatFieldMetadatasToUpdate.length} field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    if (!dataSource) {
      this.logger.error(
        `Cannot backfill field metadata layout for workspace ${workspaceId}: no data source. Skipping, rerun once the workspace is reachable.`,
      );

      return;
    }

    // Direct writes: the workspace migration validators re-validate the whole
    // merged entity and reject pre-existing shapes (e.g. non-nullable relation
    // fields with a null default) for a layout-only change.
    await dataSource.transaction(async (entityManager) => {
      for (const flatFieldMetadata of flatFieldMetadatasToUpdate) {
        await entityManager.query(
          `UPDATE "core"."fieldMetadata" SET "position" = $1, "isVisibleByDefault" = $2 WHERE "id" = $3 AND "workspaceId" = $4 AND "position" IS NULL`,
          [
            flatFieldMetadata.position,
            flatFieldMetadata.isVisibleByDefault,
            flatFieldMetadata.id,
            workspaceId,
          ],
        );
      }
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatFieldMetadataMaps',
    ]);

    this.logger.log(
      `Backfilled layout for ${flatFieldMetadatasToUpdate.length} field(s) for workspace ${workspaceId}`,
    );
  }
}
