import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getStandardObjectMetadataRelatedEntityIds } from 'src/engine/workspace-manager/twenty-standard-application/utils/get-standard-object-metadata-related-entity-ids.util';
import { buildStandardFlatRelatedRecordPathMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/related-record-path/build-standard-flat-related-record-path-maps.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.55.0', 1793368532497)
@Command({
  name: 'upgrade:2-55:add-standard-related-record-paths',
  description:
    'Add the standard related record paths that mirror inherited readability',
})
export class AddStandardRelatedRecordPathsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatFieldMetadataMaps, flatRelatedRecordPathMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatRelatedRecordPathMaps',
      ]);
    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const existingOneHopFieldUniversalIdentifiers = new Set(
      Object.values(flatRelatedRecordPathMaps.byUniversalIdentifier)
        .filter(isDefined)
        .filter(
          (flatRelatedRecordPath) =>
            !isDefined(
              flatRelatedRecordPath.secondFieldMetadataUniversalIdentifier,
            ),
        )
        .map(
          (flatRelatedRecordPath) =>
            flatRelatedRecordPath.firstFieldMetadataUniversalIdentifier,
        ),
    );

    // Older workspaces may lack some standard objects or have deactivated their relations.
    const flatRelatedRecordPathsToCreate = Object.values(
      buildStandardFlatRelatedRecordPathMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
        standardObjectMetadataRelatedEntityIds:
          getStandardObjectMetadataRelatedEntityIds(),
      }).byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(({ firstFieldMetadataUniversalIdentifier }) => {
        const firstFlatFieldMetadata =
          flatFieldMetadataMaps.byUniversalIdentifier[
            firstFieldMetadataUniversalIdentifier
          ];

        return (
          !existingOneHopFieldUniversalIdentifiers.has(
            firstFieldMetadataUniversalIdentifier,
          ) &&
          isDefined(firstFlatFieldMetadata) &&
          firstFlatFieldMetadata.isActive
        );
      });

    if (flatRelatedRecordPathsToCreate.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating ${flatRelatedRecordPathsToCreate.length} standard related record path(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            relatedRecordPath: {
              flatEntityToCreate: flatRelatedRecordPathsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to add standard related record paths for workspace ${workspaceId}`,
      );
    }
  }
}
