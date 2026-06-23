import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildSearchFieldMetadataBackfillOperations } from 'src/database/commands/upgrade-version-command/2-16/utils/build-search-field-metadata-backfill-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.16.0', 1799100000000)
@Command({
  name: 'upgrade:2-16:backfill-search-field-metadata',
  description:
    'Backfill searchFieldMetadata rows for each searchable object. Standard objects mirror their SEARCH_FIELDS_FOR_* set; custom objects get their label-identifier field. Idempotent: existing rows are skipped.',
})
export class BackfillSearchFieldMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatSearchFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatSearchFieldMetadataMaps',
    ]);

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    // The standard-application sync does not run during upgrades, so standard objects'
    // rows are backfilled from the same definition provisioning uses
    // (SEARCH_FIELDS_FOR_*), not by parsing the searchVector asExpression.
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const {
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    } = buildSearchFieldMetadataBackfillOperations({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatSearchFieldMetadataMaps,
      standardFlatSearchFieldMetadataMaps:
        standardAllFlatEntityMaps.flatSearchFieldMetadataMaps,
      customApplicationId: workspaceCustomFlatApplication.id,
    });

    const applicationUniversalIdentifiers = Object.keys(
      flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier,
    );

    const totalRowsToCreate = applicationUniversalIdentifiers.reduce(
      (total, applicationUniversalIdentifier) =>
        total +
        (flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
          applicationUniversalIdentifier
        ]?.length ?? 0),
      0,
    );

    if (totalRowsToCreate === 0) {
      this.logger.log(
        `No missing searchFieldMetadata rows for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Found ${totalRowsToCreate} missing searchFieldMetadata row(s) for workspace ${workspaceId} across ${applicationUniversalIdentifiers.length} application(s)`,
    );

    if (isDryRun) {
      return;
    }

    // One migration per application: the runner assigns applicationId from the single
    // application passed here, keeping custom-object rows tied to the custom application.
    for (const applicationUniversalIdentifier of applicationUniversalIdentifiers) {
      const flatSearchFieldMetadataToCreate =
        flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier[
          applicationUniversalIdentifier
        ];

      if (
        !isDefined(flatSearchFieldMetadataToCreate) ||
        flatSearchFieldMetadataToCreate.length === 0
      ) {
        continue;
      }

      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            isSystemBuild: true,
            allFlatEntityOperationByMetadataName: {
              searchFieldMetadata: {
                flatEntityToCreate: flatSearchFieldMetadataToCreate,
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            applicationUniversalIdentifier,
          },
        );

      if (validateAndBuildResult.status === 'fail') {
        this.logger.error(
          `Failed to persist searchFieldMetadata rows for application ${applicationUniversalIdentifier}:\n${JSON.stringify(
            validateAndBuildResult,
            null,
            2,
          )}`,
        );

        throw new Error(
          `Failed to persist searchFieldMetadata rows for workspace ${workspaceId}`,
        );
      }
    }

    this.logger.log(
      `Successfully backfilled ${totalRowsToCreate} searchFieldMetadata row(s) for workspace ${workspaceId}`,
    );
  }
}
