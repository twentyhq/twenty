import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildWorkflowFavoriteCoreIdBackfillUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-workflow-favorite-core-id-backfill-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.42.0', 1789981200000)
@Command({
  name: 'upgrade:2-42:backfill-workflow-favorites-to-core-ids',
  description:
    'Point workflow favorites at the core workflow id instead of the workspace mirror id',
})
export class BackfillWorkflowFavoritesToCoreIdsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping workflow favorite backfill`,
      );

      return;
    }

    const { flatNavigationMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatNavigationMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const workflowObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
      });

    if (!isDefined(workflowObjectMetadata)) {
      return;
    }

    const coreWorkflowRows: {
      id: string;
      workspaceWorkflowId: string;
    }[] = await dataSource.query(
      `SELECT "id", "workspaceWorkflowId"
       FROM core."workflow"
       WHERE "workspaceId" = $1 AND "workspaceWorkflowId" IS NOT NULL
       ORDER BY "createdAt" ASC, "id" ASC`,
      [workspaceId],
    );

    const coreWorkflowIdByWorkspaceWorkflowId = new Map<string, string>();

    for (const { id, workspaceWorkflowId } of coreWorkflowRows) {
      if (!coreWorkflowIdByWorkspaceWorkflowId.has(workspaceWorkflowId)) {
        coreWorkflowIdByWorkspaceWorkflowId.set(workspaceWorkflowId, id);
      }
    }

    if (coreWorkflowIdByWorkspaceWorkflowId.size === 0) {
      return;
    }

    const navigationMenuItemsToUpdate =
      buildWorkflowFavoriteCoreIdBackfillUpdates({
        flatNavigationMenuItems: Object.values(
          flatNavigationMenuItemMaps.byUniversalIdentifier,
        ).filter(isDefined),
        workflowObjectMetadataId: workflowObjectMetadata.id,
        coreWorkflowIdByWorkspaceWorkflowId,
      });

    if (navigationMenuItemsToUpdate.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would repoint ${navigationMenuItemsToUpdate.length} workflow favorite(s) to core ids for workspace ${workspaceId}`,
      );

      return;
    }

    for (const { id, targetRecordId } of navigationMenuItemsToUpdate) {
      await dataSource.query(
        `UPDATE core."navigationMenuItem"
         SET "targetRecordId" = $1, "updatedAt" = now()
         WHERE "id" = $2 AND "workspaceId" = $3`,
        [targetRecordId, id, workspaceId],
      );
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatNavigationMenuItemMaps',
    ]);

    this.logger.log(
      `Repointed ${navigationMenuItemsToUpdate.length} workflow favorite(s) to core ids for workspace ${workspaceId}`,
    );
  }
}
