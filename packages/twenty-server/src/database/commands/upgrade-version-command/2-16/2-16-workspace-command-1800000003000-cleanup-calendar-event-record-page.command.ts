import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Universal identifiers seeded by the reverted 2.15.0
// SyncCalendarEventRecordPageCommand (#21857). They are hard-coded here
// because the corresponding constants in twenty-shared have been removed by
// the revert, but workspaces that already ran the original sync still hold
// these metadata rows.
const CALENDAR_EVENT_RECORD_PAGE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  'b9b10e40-9ce2-4704-8ac6-c6e92e2563c1';

const CALENDAR_EVENT_RECORD_PAGE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS = [
  'c80a0407-25f5-438b-8c32-1ce9cde95657', // home
  '9cb35d6d-932d-49bc-b303-593116ca5343', // timeline
];

const CALENDAR_EVENT_RECORD_PAGE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  'fea5c1c2-0c1d-4d2e-a14c-a10108b0db0f', // fields
  '6faea537-02fa-4993-957c-f2e1654986bd', // participants
  'f473b435-e2d4-4928-8d90-1db0094389f7', // callRecordings
  '8273e2c4-cc17-4d3e-ba08-5bac612b5d44', // timeline
];

const CALENDAR_EVENT_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER =
  'c73668d1-022d-4eaf-b825-4e2548180db6';

const CALENDAR_EVENT_RECORD_PAGE_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS = [
  'aeadeb9e-3673-4c0c-8845-f59cb1e6ca42', // general
  'eb1aadeb-7feb-44d1-9f9a-e9929e8690fc', // system
];

const CALENDAR_EVENT_RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  'd17fc76f-2c3a-4c84-8249-27227bf71638', // title
  '7bbd3744-d870-4704-882c-071732ed23d9', // startsAt
  'ed7ca7e9-c8b3-4516-be4c-6491a27af847', // endsAt
  '5d8f89b7-ec9e-41d6-9efe-96f9c32e6c20', // isFullDay
  'a01f490d-cf67-4458-801e-13d81e74b45a', // isCanceled
  '5ad748ae-e1bb-47bb-ac34-d82663c31b6e', // conferenceLink
  '66c73e74-56e6-40c3-b776-0081ee757b8a', // location
  'a09449be-b23f-48d4-b0dc-0bd36813220a', // description
  '689c3eba-bedf-4a52-b9f1-3e34ce718251', // externalCreatedAt
  '7823fa45-8cba-47ba-8dfb-5841bef44fc6', // externalUpdatedAt
  '8be763dd-6217-47fb-a7d2-ac223af881d2', // iCalUid
  '795905b6-c6f8-42cf-b8ea-3e5b6d32145f', // conferenceSolution
];

@RegisteredWorkspaceCommand('2.16.0', 1800000003000)
@Command({
  name: 'upgrade:2-16:cleanup-calendar-event-record-page',
  description:
    'Remove the CalendarEvent record page layout, view and associated tabs/widgets/fields that were seeded by the reverted 2.15.0 sync command (#21857)',
})
export class CleanupCalendarEventRecordPageCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    const pageLayoutsToDelete = [
      findFlatEntityByUniversalIdentifier<FlatPageLayout>({
        flatEntityMaps: flatPageLayoutMaps,
        universalIdentifier:
          CALENDAR_EVENT_RECORD_PAGE_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
      }),
    ].filter(isDefined);

    const pageLayoutTabsToDelete =
      CALENDAR_EVENT_RECORD_PAGE_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatPageLayoutTab>({
            flatEntityMaps: flatPageLayoutTabMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);

    const pageLayoutWidgetsToDelete =
      CALENDAR_EVENT_RECORD_PAGE_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatPageLayoutWidget>({
            flatEntityMaps: flatPageLayoutWidgetMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);

    const viewsToDelete = [
      findFlatEntityByUniversalIdentifier<FlatView>({
        flatEntityMaps: flatViewMaps,
        universalIdentifier:
          CALENDAR_EVENT_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIER,
      }),
    ].filter(isDefined);

    const viewFieldGroupsToDelete =
      CALENDAR_EVENT_RECORD_PAGE_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatViewFieldGroup>({
            flatEntityMaps: flatViewFieldGroupMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);

    const viewFieldsToDelete =
      CALENDAR_EVENT_RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatViewField>({
            flatEntityMaps: flatViewFieldMaps,
            universalIdentifier,
          }),
      ).filter(isDefined);

    const totalDeleteCount =
      pageLayoutsToDelete.length +
      pageLayoutTabsToDelete.length +
      pageLayoutWidgetsToDelete.length +
      viewsToDelete.length +
      viewFieldGroupsToDelete.length +
      viewFieldsToDelete.length;

    if (totalDeleteCount === 0) {
      this.logger.log(
        `No CalendarEvent record page metadata to clean up for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${totalDeleteCount} CalendarEvent record page metadata item(s) for workspace ${workspaceId}`,
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
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewsToDelete,
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldGroupsToDelete,
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldsToDelete,
              flatEntityToUpdate: [],
            },
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutsToDelete,
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutTabsToDelete,
              flatEntityToUpdate: [],
            },
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutWidgetsToDelete,
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
        `Failed to clean up CalendarEvent record page metadata for workspace ${workspaceId}:\n${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );

      throw new Error(
        `Failed to clean up CalendarEvent record page metadata for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Deleted ${totalDeleteCount} CalendarEvent record page metadata item(s) for workspace ${workspaceId}`,
    );
  }
}
