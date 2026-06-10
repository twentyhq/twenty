import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.universalIdentifier;
const CALL_RECORDING_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.fields.recordingRequestStatus
    .universalIdentifier;
const CALL_RECORDING_REQUEST_STATUS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.callRecording.views.allCallRecordings.viewFields
    .recordingRequestStatus.universalIdentifier,
  STANDARD_OBJECTS.callRecording.views.callRecordingRecordPageFields.viewFields
    .recordingRequestStatus.universalIdentifier,
];
const CALL_RECORDING_REQUEST_STATUS_FIELD_NAME = 'recordingRequestStatus';

@RegisteredWorkspaceCommand('2.12.0', 1799000060000)
@Command({
  name: 'upgrade:2-12:sync-call-recording-request-status',
  description:
    'Create the CallRecording recordingRequestStatus metadata in existing workspaces',
})
export class SyncCallRecordingRequestStatusCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { flatFieldMetadataMaps, flatObjectMetadataMaps, flatViewFieldMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
        'flatViewFieldMaps',
      ]);

    const existingCallRecordingObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        CALL_RECORDING_OBJECT_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(existingCallRecordingObjectMetadata)) {
      this.logger.log(
        `CallRecording object metadata does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const existingRecordingRequestStatusField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        CALL_RECORDING_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (
      !isDefined(existingRecordingRequestStatusField) &&
      hasFieldNameConflict({
        flatFieldMetadatas: Object.values(
          flatFieldMetadataMaps.byUniversalIdentifier,
        ).filter(isDefined),
        callRecordingObjectMetadata: existingCallRecordingObjectMetadata,
      })
    ) {
      this.logger.warn(
        `Field name "${CALL_RECORDING_REQUEST_STATUS_FIELD_NAME}" is already taken on CallRecording for workspace ${workspaceId}; skipping`,
      );

      return;
    }

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const recordingRequestStatusFieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatFieldMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        existingFlatEntityMaps: flatFieldMetadataMaps,
        universalIdentifiers: [
          CALL_RECORDING_REQUEST_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
        ],
      });
    const recordingRequestStatusViewFieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        existingFlatEntityMaps: flatViewFieldMaps,
        universalIdentifiers:
          CALL_RECORDING_REQUEST_STATUS_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      });

    const totalOperationCount =
      recordingRequestStatusFieldsToCreate.length +
      recordingRequestStatusViewFieldsToCreate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `CallRecording recordingRequestStatus metadata already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Creating ${totalOperationCount} CallRecording recordingRequestStatus metadata item(s) for workspace ${workspaceId}`,
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
              flatEntityToCreate: recordingRequestStatusFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: recordingRequestStatusViewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to create CallRecording recordingRequestStatus metadata for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Created ${totalOperationCount} CallRecording recordingRequestStatus metadata item(s) for workspace ${workspaceId}`,
    );
  }
}

const hasFieldNameConflict = ({
  flatFieldMetadatas,
  callRecordingObjectMetadata,
}: {
  flatFieldMetadatas: FlatFieldMetadata[];
  callRecordingObjectMetadata: FlatObjectMetadata;
}): boolean =>
  flatFieldMetadatas.some(
    (flatFieldMetadata) =>
      flatFieldMetadata.objectMetadataUniversalIdentifier ===
        callRecordingObjectMetadata.universalIdentifier &&
      flatFieldMetadata.name === CALL_RECORDING_REQUEST_STATUS_FIELD_NAME,
  );
