import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type FieldMetadataComplexOption,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { CallRecordingStatus } from 'src/modules/call-recording/common/enums/call-recording-status.enum';

const CALL_RECORDING_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.fields.status.universalIdentifier;
const CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.universalIdentifier;

// Same option id as the standard definition so provisioned and upgraded workspaces match.
const NOT_ATTENDED_STATUS_OPTION: FieldMetadataComplexOption = {
  id: 'cbd14df8-9cc2-4399-92f5-31fc41f3768b',
  value: CallRecordingStatus.NOT_ATTENDED,
  label: 'Not attended',
  position: 6,
  color: 'yellow',
};

@RegisteredWorkspaceCommand('2.25.0', 1785239640000)
@Command({
  name: 'upgrade:2-25:add-not-attended-call-recording-status',
  description:
    'Add the NOT_ATTENDED option to the CallRecording status select in existing workspaces',
})
export class AddNotAttendedCallRecordingStatusCommand extends ProvisionedWorkspaceCommandRunner {
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
    const currentOptions = selectStatusField.options ?? [];
    const hasNotAttendedStatus = currentOptions.some(
      (option) => option.value === CallRecordingStatus.NOT_ATTENDED,
    );

    if (hasNotAttendedStatus) {
      this.logger.log(
        `CallRecording status metadata already has NOT_ATTENDED for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Adding NOT_ATTENDED to CallRecording status metadata for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const nextOptionPosition =
      currentOptions.reduce(
        (highestPosition, option) => Math.max(highestPosition, option.position),
        -1,
      ) + 1;

    const updatedStatusField: FlatFieldMetadata<FieldMetadataType.SELECT> = {
      ...selectStatusField,
      options: [
        ...currentOptions,
        { ...NOT_ATTENDED_STATUS_OPTION, position: nextOptionPosition },
      ],
      updatedAt: new Date().toISOString(),
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
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
        `Failed to add NOT_ATTENDED to CallRecording status metadata for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Added NOT_ATTENDED to CallRecording status metadata for workspace ${workspaceId}`,
    );
  }
}
