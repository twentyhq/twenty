import { Command } from 'nest-commander';

import { MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.39.0', 1788616958245)
@Command({
  name: 'upgrade:2-39:mark-platform-owned-standard-objects-system',
  description:
    'Sync the writability of standard objects with the standard-application definitions: platform-owned objects become SYSTEM on existing workspaces',
})
export class MarkPlatformOwnedStandardObjectsSystemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatObjectMetadataMaps: existingFlatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const flatObjectMetadatasToUpdate = Object.values(
      standardAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (standardFlatObjectMetadata) =>
          standardFlatObjectMetadata.writability === MetadataWritability.SYSTEM,
      )
      .map((standardFlatObjectMetadata) => {
        const existingFlatObjectMetadata =
          existingFlatObjectMetadataMaps.byUniversalIdentifier[
            standardFlatObjectMetadata.universalIdentifier
          ];

        if (
          !isDefined(existingFlatObjectMetadata) ||
          existingFlatObjectMetadata.writability ===
            standardFlatObjectMetadata.writability
        ) {
          return undefined;
        }

        return {
          ...existingFlatObjectMetadata,
          writability: standardFlatObjectMetadata.writability,
        };
      })
      .filter(isDefined);

    if (flatObjectMetadatasToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would mark' : 'Marking'} ${flatObjectMetadatasToUpdate.length} standard object(s) as SYSTEM for workspace ${workspaceId}: ${flatObjectMetadatasToUpdate
        .map((flatObjectMetadata) => flatObjectMetadata.nameSingular)
        .join(', ')}`,
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          dryRun: isDryRun,
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatObjectMetadatasToUpdate,
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to mark standard objects as SYSTEM:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to mark standard objects as SYSTEM for workspace ${workspaceId}`,
      );
    }
  }
}
