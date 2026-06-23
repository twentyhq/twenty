import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Universal identifier of the participant field widget seeded by the original
// 2.15.0 SyncCalendarEventRecordPageCommand (#21857). Hard-coded here because it
// has been removed from the twenty-shared constants, but workspaces that already
// ran the original sync still hold this widget row.
const CALENDAR_EVENT_PARTICIPANTS_WIDGET_UNIVERSAL_IDENTIFIER =
  '6faea537-02fa-4993-957c-f2e1654986bd';

const CALENDAR_EVENT_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields
    .universalIdentifier;

const CALENDAR_EVENT_RECORD_PAGE_AUDIT_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields.viewFields
    .createdAt.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields.viewFields
    .createdBy.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields.viewFields
    .updatedAt.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.views.calendarEventRecordPageFields.viewFields
    .updatedBy.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.16.0', 1800000004000)
@Command({
  name: 'upgrade:2-16:update-calendar-event-record-page',
  description:
    'Remove the participant field widget and add audit (createdAt/createdBy/updatedAt/updatedBy) view fields to the CalendarEvent record page in existing workspaces',
})
export class UpdateCalendarEventRecordPageCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const { flatViewMaps, flatViewFieldMaps, flatPageLayoutWidgetMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatViewMaps',
        'flatViewFieldMaps',
        'flatPageLayoutWidgetMaps',
      ]);

    const recordPageView = findFlatEntityByUniversalIdentifier<FlatView>({
      flatEntityMaps: flatViewMaps,
      universalIdentifier: CALENDAR_EVENT_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
    });

    if (!isDefined(recordPageView)) {
      this.logger.log(
        `CalendarEvent record page does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const participantsWidgetsToDelete = [
      findFlatEntityByUniversalIdentifier<FlatPageLayoutWidget>({
        flatEntityMaps: flatPageLayoutWidgetMaps,
        universalIdentifier:
          CALENDAR_EVENT_PARTICIPANTS_WIDGET_UNIVERSAL_IDENTIFIER,
      }),
    ].filter(isDefined);

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const auditViewFieldsToCreate =
      getStandardFlatEntitiesToCreateOrThrow<FlatViewField>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatViewFieldMaps,
        existingFlatEntityMaps: flatViewFieldMaps,
        universalIdentifiers:
          CALENDAR_EVENT_RECORD_PAGE_AUDIT_VIEW_FIELD_UNIVERSAL_IDENTIFIERS,
      });

    const totalOperationCount =
      participantsWidgetsToDelete.length + auditViewFieldsToCreate.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `CalendarEvent record page already up to date for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would update CalendarEvent record page for workspace ${workspaceId}: delete ${participantsWidgetsToDelete.length} widget(s), create ${auditViewFieldsToCreate.length} view field(s)`,
      );

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
            viewField: {
              flatEntityToCreate: auditViewFieldsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: participantsWidgetsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to update CalendarEvent record page for workspace ${workspaceId}:\n${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );

      throw new Error(
        `Failed to update CalendarEvent record page for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Updated CalendarEvent record page for workspace ${workspaceId}: deleted ${participantsWidgetsToDelete.length} widget(s), created ${auditViewFieldsToCreate.length} view field(s)`,
    );
  }
}
