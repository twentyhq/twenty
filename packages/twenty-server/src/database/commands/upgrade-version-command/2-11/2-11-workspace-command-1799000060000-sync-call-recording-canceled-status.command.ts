import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALL_RECORDING_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.fields.status.universalIdentifier;

const CANCELED_CALL_RECORDING_STATUS = 'CANCELED';

@RegisteredWorkspaceCommand('2.11.0', 1799000060000)
@Command({
  name: 'upgrade:2-11:sync-call-recording-canceled-status',
  description:
    'Add the CANCELED option to the CallRecording status field in existing workspaces',
})
export class SyncCallRecordingCanceledStatusCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const existingStatusField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        CALL_RECORDING_STATUS_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(existingStatusField)) {
      this.logger.log(
        `CallRecording status field does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (hasCanceledOption(existingStatusField)) {
      this.logger.log(
        `CallRecording status field already includes ${CANCELED_CALL_RECORDING_STATUS} for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardStatusField =
      standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
        CALL_RECORDING_STATUS_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(standardStatusField?.options)) {
      throw new Error(
        `Standard CallRecording status field options not found for workspace ${workspaceId}`,
      );
    }

    const statusFieldToUpdate: FlatFieldMetadata = {
      ...existingStatusField,
      options: standardStatusField.options,
      updatedAt: new Date().toISOString(),
    };

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Adding ${CANCELED_CALL_RECORDING_STATUS} to CallRecording status field for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [statusFieldToUpdate],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to add ${CANCELED_CALL_RECORDING_STATUS} to CallRecording status field for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Added ${CANCELED_CALL_RECORDING_STATUS} to CallRecording status field for workspace ${workspaceId}`,
    );
  }
}

const hasCanceledOption = (fieldMetadata: FlatFieldMetadata): boolean =>
  fieldMetadata.options?.some(
    (option) => option.value === CANCELED_CALL_RECORDING_STATUS,
  ) === true;
