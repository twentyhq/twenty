import { Command } from 'nest-commander';

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

const CALENDAR_EVENT_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIERS = [
  'c73668d1-022d-4eaf-b825-4e2548180db6',
];

const CALENDAR_EVENT_RECORD_PAGE_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS = [
  'aeadeb9e-3673-4c0c-8845-f59cb1e6ca42',
  'eb1aadeb-7feb-44d1-9f9a-e9929e8690fc',
];

const CALENDAR_EVENT_RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIERS = [
  'd17fc76f-2c3a-4c84-8249-27227bf71638',
  '7bbd3744-d870-4704-882c-071732ed23d9',
  'ed7ca7e9-c8b3-4516-be4c-6491a27af847',
  '5d8f89b7-ec9e-41d6-9efe-96f9c32e6c20',
  'a01f490d-cf67-4458-801e-13d81e74b45a',
  '5ad748ae-e1bb-47bb-ac34-d82663c31b6e',
  '66c73e74-56e6-40c3-b776-0081ee757b8a',
  'a09449be-b23f-48d4-b0dc-0bd36813220a',
  '689c3eba-bedf-4a52-b9f1-3e34ce718251',
  '7823fa45-8cba-47ba-8dfb-5841bef44fc6',
  '8be763dd-6217-47fb-a7d2-ac223af881d2',
  '795905b6-c6f8-42cf-b8ea-3e5b6d32145f',
];

const CALENDAR_EVENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS = [
  'b9b10e40-9ce2-4704-8ac6-c6e92e2563c1',
];

const CALENDAR_EVENT_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS = [
  'c80a0407-25f5-438b-8c32-1ce9cde95657',
  '9cb35d6d-932d-49bc-b303-593116ca5343',
];

const CALENDAR_EVENT_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  'fea5c1c2-0c1d-4d2e-a14c-a10108b0db0f',
  '6faea537-02fa-4993-957c-f2e1654986bd',
  'f473b435-e2d4-4928-8d90-1db0094389f7',
  '8273e2c4-cc17-4d3e-ba08-5bac612b5d44',
];

@RegisteredWorkspaceCommand('2.16.0', 1782200000000)
@Command({
  name: 'upgrade:2-16:drop-calendar-event-record-page',
  description:
    'Drop the CalendarEvent record page layout and fields view created by 2.15.0',
})
export class DropCalendarEventRecordPageCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const viewsToDelete = CALENDAR_EVENT_RECORD_PAGE_VIEW_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatView>({
          flatEntityMaps: flatViewMaps,
          universalIdentifier,
        }),
    ).filter((entity): entity is FlatView => entity !== undefined);

    const viewFieldGroupsToDelete =
      CALENDAR_EVENT_RECORD_PAGE_VIEW_FIELD_GROUP_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatViewFieldGroup>({
            flatEntityMaps: flatViewFieldGroupMaps,
            universalIdentifier,
          }),
      ).filter(
        (entity): entity is FlatViewFieldGroup => entity !== undefined,
      );

    const viewFieldsToDelete =
      CALENDAR_EVENT_RECORD_PAGE_VIEW_FIELD_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatViewField>({
            flatEntityMaps: flatViewFieldMaps,
            universalIdentifier,
          }),
      ).filter((entity): entity is FlatViewField => entity !== undefined);

    const pageLayoutsToDelete = CALENDAR_EVENT_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.map(
      (universalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatPageLayout>({
          flatEntityMaps: flatPageLayoutMaps,
          universalIdentifier,
        }),
    ).filter((entity): entity is FlatPageLayout => entity !== undefined);

    const pageLayoutTabsToDelete =
      CALENDAR_EVENT_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatPageLayoutTab>({
            flatEntityMaps: flatPageLayoutTabMaps,
            universalIdentifier,
          }),
      ).filter((entity): entity is FlatPageLayoutTab => entity !== undefined);

    const pageLayoutWidgetsToDelete =
      CALENDAR_EVENT_PAGE_LAYOUT_WIDGET_UNIVERSAL_IDENTIFIERS.map(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier<FlatPageLayoutWidget>({
            flatEntityMaps: flatPageLayoutWidgetMaps,
            universalIdentifier,
          }),
      ).filter(
        (entity): entity is FlatPageLayoutWidget => entity !== undefined,
      );

    const totalOperationCount =
      viewsToDelete.length +
      viewFieldGroupsToDelete.length +
      viewFieldsToDelete.length +
      pageLayoutsToDelete.length +
      pageLayoutTabsToDelete.length +
      pageLayoutWidgetsToDelete.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `CalendarEvent record page metadata already absent for workspace ${workspaceId}`,
      );

      return;
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${totalOperationCount} CalendarEvent record page metadata item(s) for workspace ${workspaceId}`,
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
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            pageLayoutWidget: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutWidgetsToDelete,
              flatEntityToUpdate: [],
            },
            pageLayoutTab: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutTabsToDelete,
              flatEntityToUpdate: [],
            },
            pageLayout: {
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutsToDelete,
              flatEntityToUpdate: [],
            },
            viewField: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldsToDelete,
              flatEntityToUpdate: [],
            },
            viewFieldGroup: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewFieldGroupsToDelete,
              flatEntityToUpdate: [],
            },
            view: {
              flatEntityToCreate: [],
              flatEntityToDelete: viewsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to delete CalendarEvent record page metadata for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Deleted ${totalOperationCount} CalendarEvent record page metadata item(s) for workspace ${workspaceId}`,
    );
  }
}
