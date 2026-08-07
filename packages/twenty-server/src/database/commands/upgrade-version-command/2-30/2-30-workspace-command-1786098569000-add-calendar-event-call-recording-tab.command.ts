import { Command } from 'nest-commander';

import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALENDAR_EVENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage
    .universalIdentifier;

const CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording.universalIdentifier;

const TRANSCRIPT_WIDGET_UNIVERSAL_IDENTIFIER =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.calendarEventRecordPage.tabs
    .callRecording.widgets.transcript.universalIdentifier;

@RegisteredWorkspaceCommand('2.30.0', 1786098569000)
@Command({
  name: 'upgrade:2-30:add-calendar-event-call-recording-tab',
  description:
    'Add the Call Recording tab and transcript widget to the CalendarEvent record page in existing workspaces',
})
export class AddCalendarEventCallRecordingTabCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatPageLayoutMaps, flatPageLayoutTabMaps, flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatPageLayoutMaps',
        'flatPageLayoutTabMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    const existingPageLayout =
      flatPageLayoutMaps.byUniversalIdentifier[
        CALENDAR_EVENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(existingPageLayout)) {
      this.logger.log(
        `CalendarEvent page layout does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const pageLayoutTabsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutTabMaps,
        existingFlatEntityMaps: flatPageLayoutTabMaps,
        universalIdentifiers: [CALL_RECORDING_TAB_UNIVERSAL_IDENTIFIER],
      });

    const pageLayoutWidgetsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers: [TRANSCRIPT_WIDGET_UNIVERSAL_IDENTIFIER],
      });

    const totalOperationCount =
      pageLayoutTabsToCreate.length + pageLayoutWidgetsToCreate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `CalendarEvent record page already has the Call Recording tab for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Applying ${totalOperationCount} CalendarEvent Call Recording tab operation(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            pageLayoutTab: {
              flatEntityToCreate: pageLayoutTabsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: pageLayoutWidgetsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to add the CalendarEvent Call Recording tab for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Added the CalendarEvent Call Recording tab for workspace ${workspaceId}`,
    );
  }
}
