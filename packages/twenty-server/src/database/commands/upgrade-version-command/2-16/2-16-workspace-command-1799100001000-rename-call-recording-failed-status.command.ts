import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALL_RECORDING_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.fields.status.universalIdentifier;
const CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.universalIdentifier;
const LEGACY_FAILED_STATUS = 'FAILED_UNKNOWN';
const FAILED_STATUS = 'FAILED';

@RegisteredWorkspaceCommand('2.16.0', 1799100001000)
@Command({
  name: 'upgrade:2-16:rename-call-recording-failed-status',
  description:
    'Rename CallRecording status FAILED_UNKNOWN to FAILED in existing workspaces',
})
export class RenameCallRecordingFailedStatusCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const callRecordingObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(callRecordingObject)) {
      this.logger.log(
        `CallRecording object metadata does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const statusField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        CALL_RECORDING_STATUS_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(statusField)) {
      this.logger.log(
        `CallRecording status field metadata does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (statusField.type !== FieldMetadataType.SELECT) {
      throw new Error(
        `CallRecording status metadata is not a SELECT field for workspace ${workspaceId}`,
      );
    }

    const selectStatusField =
      statusField as FlatFieldMetadata<FieldMetadataType.SELECT>;
    const optionsWithFailedStatus = (selectStatusField.options ?? []).map(
      (option) =>
        option.value === LEGACY_FAILED_STATUS
          ? { ...option, value: FAILED_STATUS }
          : option,
    );
    const hasLegacyFailedStatus = optionsWithFailedStatus.some(
      (option, index) =>
        option.value !== selectStatusField.options?.[index]?.value,
    );

    if (!hasLegacyFailedStatus) {
      this.logger.log(
        `CallRecording failed status already migrated for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Renaming CallRecording status ${LEGACY_FAILED_STATUS} to ${FAILED_STATUS} for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const updatedStatusField: FlatFieldMetadata<FieldMetadataType.SELECT> = {
      ...selectStatusField,
      options: optionsWithFailedStatus,
      updatedAt: new Date().toISOString(),
    };

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
              flatEntityToUpdate: [updatedStatusField],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to rename CallRecording failed status for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Renamed CallRecording status ${LEGACY_FAILED_STATUS} to ${FAILED_STATUS} for workspace ${workspaceId}`,
    );
  }
}
