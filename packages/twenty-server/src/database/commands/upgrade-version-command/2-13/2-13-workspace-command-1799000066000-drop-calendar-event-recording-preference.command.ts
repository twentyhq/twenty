import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER =
  '1d231e7e-9bbe-410b-8007-ea7678a83e58';

@RegisteredWorkspaceCommand('2.13.0', 1799000066000)
@Command({
  name: 'upgrade:2-13:drop-calendar-event-recording-preference',
  description: 'Drop the CalendarEvent recordingPreference field metadata',
})
export class DropCalendarEventRecordingPreferenceCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
      `${isDryRun ? '[DRY RUN] ' : ''}Starting CalendarEvent recordingPreference field removal for workspace ${workspaceId}`,
    );

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const recordingPreferenceFieldMetadata =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          CALENDAR_EVENT_RECORDING_PREFERENCE_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!recordingPreferenceFieldMetadata) {
      this.logger.log(
        `CalendarEvent recordingPreference field already absent for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would delete CalendarEvent recordingPreference field for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [recordingPreferenceFieldMetadata],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to delete CalendarEvent recordingPreference field:\n${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );

      throw new Error(
        `Failed to delete CalendarEvent recordingPreference field for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Deleted CalendarEvent recordingPreference field for workspace ${workspaceId}`,
    );
  }
}
