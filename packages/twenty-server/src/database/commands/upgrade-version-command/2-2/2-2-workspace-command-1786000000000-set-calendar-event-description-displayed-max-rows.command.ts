import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  type FieldMetadataSettings,
} from 'twenty-shared/types';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const DISPLAYED_MAX_ROWS = 99;

@RegisteredWorkspaceCommand('2.2.0', 1786000000000)
@Command({
  name: 'upgrade:2-2:set-calendar-event-description-displayed-max-rows',
  description:
    'Set displayedMaxRows setting on calendarEvent.description field',
})
export class SetCalendarEventDescriptionDisplayedMaxRowsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const descriptionField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          STANDARD_OBJECTS.calendarEvent.fields.description.universalIdentifier,
      });

    if (!descriptionField) {
      this.logger.log(
        `calendarEvent.description field not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const textSettings =
      descriptionField.settings as FieldMetadataSettings<FieldMetadataType.TEXT>;

    if (textSettings?.displayedMaxRows === DISPLAYED_MAX_ROWS) {
      this.logger.log(
        `calendarEvent.description displayedMaxRows already set for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would set displayedMaxRows on calendarEvent.description for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const fieldToUpdate = {
      ...descriptionField,
      settings: {
        ...textSettings,
        displayedMaxRows: DISPLAYED_MAX_ROWS,
      },
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [fieldToUpdate],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to set displayedMaxRows on calendarEvent.description for workspace ${workspaceId}: ${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
    }

    this.logger.log(
      `Set displayedMaxRows on calendarEvent.description for workspace ${workspaceId}`,
    );
  }
}
