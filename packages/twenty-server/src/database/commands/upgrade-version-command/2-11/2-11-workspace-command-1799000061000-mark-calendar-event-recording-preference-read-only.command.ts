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
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.fields.recordingPreference.universalIdentifier;

@RegisteredWorkspaceCommand('2.11.0', 1799000061000)
@Command({
  name: 'upgrade:2-11:mark-calendar-event-recording-preference-read-only',
  description:
    'Mark the CalendarEvent recordingPreference field as UI read-only in existing workspaces',
})
export class MarkCalendarEventRecordingPreferenceReadOnlyCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const existingRecordingPreferenceField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(existingRecordingPreferenceField)) {
      this.logger.log(
        `CalendarEvent recordingPreference field does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (existingRecordingPreferenceField.isUIReadOnly === true) {
      this.logger.log(
        `CalendarEvent recordingPreference field is already UI read-only for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const recordingPreferenceFieldToUpdate: FlatFieldMetadata = {
      ...existingRecordingPreferenceField,
      isUIReadOnly: true,
      updatedAt: new Date().toISOString(),
    };

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Marking CalendarEvent recordingPreference field as UI read-only for workspace ${workspaceId}`,
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
              flatEntityToUpdate: [recordingPreferenceFieldToUpdate],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to mark CalendarEvent recordingPreference field as UI read-only for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Marked CalendarEvent recordingPreference field as UI read-only for workspace ${workspaceId}`,
    );
  }
}
