import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCallRecordingTranscriptSettingsUpdate } from 'src/database/commands/upgrade-version-command/2-46/utils/build-call-recording-transcript-settings-update.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.46.0', 1791550503453)
@Command({
  name: 'upgrade:2-46:set-call-recording-transcript-value-loaded-on-open',
  description:
    'Load call recording transcript values when opened unless the workspace already configured this setting',
})
export class SetCallRecordingTranscriptValueLoadedOnOpenCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const transcriptField = findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier:
        STANDARD_OBJECTS.callRecording.fields.transcript.universalIdentifier,
    });

    if (
      !isDefined(transcriptField) ||
      !isFlatFieldMetadataOfType(transcriptField, FieldMetadataType.RAW_JSON)
    ) {
      this.logger.log(
        `callRecording.transcript JSON field not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const settingsUpdate = buildCallRecordingTranscriptSettingsUpdate({
      settings: transcriptField.settings,
      universalSettings: transcriptField.universalSettings,
    });

    if (!isDefined(settingsUpdate)) {
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would set isValueLoadedOnOpen on callRecording.transcript for workspace ${workspaceId}`,
      );

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
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                {
                  ...transcriptField,
                  ...settingsUpdate,
                },
              ],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(
        result,
        `Failed to set isValueLoadedOnOpen on callRecording.transcript for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Set isValueLoadedOnOpen on callRecording.transcript for workspace ${workspaceId}`,
    );
  }

  async down({ workspaceId }: RunOnWorkspaceArgs): Promise<void> {
    // Older clients ignore this setting; removing it would erase workspace preferences.
    this.logger.log(
      `Preserving callRecording.transcript loading preference for workspace ${workspaceId}`,
    );
  }
}
