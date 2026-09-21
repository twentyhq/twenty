import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildWorkflowFavoriteCoreIdBackfillUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-workflow-favorite-core-id-backfill-updates.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

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
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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

    const coreWorkflowRows: { id: string; workspaceWorkflowId: string | null }[] =
      await dataSource.query(
        `SELECT "id", "workspaceWorkflowId" FROM core."workflow" WHERE "workspaceId" = $1 AND "workspaceWorkflowId" IS NOT NULL`,
        [workspaceId],
      );

    const coreWorkflowIdByWorkspaceWorkflowId = new Map(
      coreWorkflowRows.flatMap(({ id, workspaceWorkflowId }) =>
        isDefined(workspaceWorkflowId) ? [[workspaceWorkflowId, id] as const] : [],
      ),
    );

    if (coreWorkflowIdByWorkspaceWorkflowId.size === 0) {
      return;
    }

    const navigationMenuItemsToUpdate = buildWorkflowFavoriteCoreIdBackfillUpdates(
      {
        flatNavigationMenuItems: Object.values(
          flatNavigationMenuItemMaps.byUniversalIdentifier,
        ).filter(isDefined),
        workflowObjectMetadataId: workflowObjectMetadata.id,
        coreWorkflowIdByWorkspaceWorkflowId,
        now: new Date().toISOString(),
      },
    );

    if (navigationMenuItemsToUpdate.length === 0) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would repoint ${navigationMenuItemsToUpdate.length} workflow favorite(s) to core ids for workspace ${workspaceId}`,
      );

      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: navigationMenuItemsToUpdate,
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while backfilling workflow favorites to core ids',
      );
    }

    this.logger.log(
      `Repointed ${navigationMenuItemsToUpdate.length} workflow favorite(s) to core ids for workspace ${workspaceId}`,
    );
  }
}
