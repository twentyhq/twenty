import { Command } from 'nest-commander';

import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const CALL_RECORDING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage
    .universalIdentifier,
];

const CALL_RECORDING_PAGE_LAYOUT_HOME_TAB_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs.home
    .universalIdentifier,
];

const CALL_RECORDING_CALENDAR_EVENT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs.home
    .widgets.calendarEvent.universalIdentifier,
];

const CALL_RECORDING_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.callRecording.fields.calendarEvent.universalIdentifier;

@RegisteredWorkspaceCommand('2.20.0', 1783528000000)
@Command({
  name: 'upgrade:2-20:add-call-recording-calendar-event-widget',
  description:
    'Add the CallRecording calendarEvent relation widget to the record page in existing workspaces',
})
export class AddCallRecordingCalendarEventWidgetCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const existingCallRecordingObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.callRecording.universalIdentifier
      ];

    if (!isDefined(existingCallRecordingObjectMetadata)) {
      this.logger.log(
        `callRecording object metadata does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const calendarEventField =
      flatFieldMetadataMaps.byUniversalIdentifier[
        CALL_RECORDING_CALENDAR_EVENT_FIELD_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(calendarEventField)) {
      this.logger.log(
        `callRecording.calendarEvent field does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    // Skip when a widget for the calendarEvent field already exists (e.g. one
    // added manually before this backfill) so we never create a duplicate.
    const hasExistingCalendarEventWidget = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .some(
        (widget) =>
          !isDefined(widget.deletedAt) &&
          widget.configuration?.configurationType ===
            WidgetConfigurationType.FIELD &&
          widget.configuration.fieldMetadataId === calendarEventField.id,
      );

    if (hasExistingCalendarEventWidget) {
      this.logger.log(
        `A calendarEvent field widget already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const pageLayoutsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayout>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutMaps,
        existingFlatEntityMaps: flatPageLayoutMaps,
        universalIdentifiers: CALL_RECORDING_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
      });
    const pageLayoutTabsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutTab>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatPageLayoutTabMaps,
        existingFlatEntityMaps: flatPageLayoutTabMaps,
        universalIdentifiers:
          CALL_RECORDING_PAGE_LAYOUT_HOME_TAB_UNIVERSAL_IDENTIFIERS,
      });
    const pageLayoutWidgetsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatPageLayoutWidget>({
        standardFlatEntityMaps:
          standardAllFlatEntityMaps.flatPageLayoutWidgetMaps,
        existingFlatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifiers:
          CALL_RECORDING_CALENDAR_EVENT_WIDGET_UNIVERSAL_IDENTIFIERS,
      });

    const totalOperationCount =
      pageLayoutsToCreate.length +
      pageLayoutTabsToCreate.length +
      pageLayoutWidgetsToCreate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `CallRecording calendarEvent widget already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Creating ${totalOperationCount} CallRecording record page metadata item(s) for workspace ${workspaceId}`,
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
            pageLayout: {
              flatEntityToCreate: pageLayoutsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
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
        `Failed to create CallRecording record page metadata for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Created ${totalOperationCount} CallRecording record page metadata item(s) for workspace ${workspaceId}`,
    );
  }
}
