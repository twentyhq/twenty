import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Re-syncs the UI capability flags of standard objects and fields with their
// standard-application definitions. Covers two cases the rename instance
// command cannot reach:
// - isUICreatable is a new column (default true) and workflowRun,
//   workflowVersion and workspaceMember must become non-creatable; the
//   twenty-standard application is not re-synced on existing workspaces.
// - standard fields created by pre-2.13 workspace upgrade commands during a
//   cross-version upgrade lose their isUIEditable: false value (the column is
//   hidden until the rename instance command has run), so they would
//   otherwise stay editable after the rename backfill.
@RegisteredWorkspaceCommand('2.13.0', 1781277460000)
@Command({
  name: 'upgrade:2-13:sync-standard-ui-capability-flags',
  description:
    'Re-sync isUICreatable and isUIEditable on standard objects and isUIEditable on standard fields from the standard-application definitions',
})
export class SyncStandardUiCapabilityFlagsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Syncing standard UI capability flags for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const {
      flatObjectMetadataMaps: existingFlatObjectMetadataMaps,
      flatFieldMetadataMaps: existingFlatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const objectsToUpdate = Object.values(
      standardAllFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((standardObject) => {
        const existingObject =
          existingFlatObjectMetadataMaps.byUniversalIdentifier[
            standardObject.universalIdentifier
          ];

        if (
          !isDefined(existingObject) ||
          (existingObject.isUICreatable === standardObject.isUICreatable &&
            existingObject.isUIEditable === standardObject.isUIEditable)
        ) {
          return undefined;
        }

        return {
          ...existingObject,
          isUICreatable: standardObject.isUICreatable,
          isUIEditable: standardObject.isUIEditable,
          updatedAt: new Date().toISOString(),
        };
      })
      .filter(isDefined);

    const fieldsToUpdate = Object.values(
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((standardField) => {
        const existingField =
          existingFlatFieldMetadataMaps.byUniversalIdentifier[
            standardField.universalIdentifier
          ];

        if (
          !isDefined(existingField) ||
          existingField.isUIEditable === standardField.isUIEditable
        ) {
          return undefined;
        }

        return {
          ...existingField,
          isUIEditable: standardField.isUIEditable,
          updatedAt: new Date().toISOString(),
        };
      })
      .filter(isDefined);

    if (objectsToUpdate.length === 0 && fieldsToUpdate.length === 0) {
      this.logger.log(
        `Standard UI capability flags already up to date for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${objectsToUpdate.length} standard object(s) and ${fieldsToUpdate.length} standard field(s) with drifted UI capability flags for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would sync UI capability flags on ${objectsToUpdate.length} standard object(s) and ${fieldsToUpdate.length} standard field(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            objectMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: objectsToUpdate,
            },
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: fieldsToUpdate,
            },
          },
          workspaceId,
          // workflowRun, workflowVersion and workspaceMember are system
          // objects; without a system build the validator rejects the update.
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to sync standard UI capability flags:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to sync standard UI capability flags for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully synced UI capability flags on ${objectsToUpdate.length} standard object(s) and ${fieldsToUpdate.length} standard field(s) for workspace ${workspaceId}`,
    );
  }
}
