import { Command } from 'nest-commander';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const STANDARD_ACTIVITY_LAYOUT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.universalIdentifier,
];

const REMOVED_TAB_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.note
    .universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.timeline
    .universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.files
    .universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.note
    .universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.timeline
    .universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.files
    .universalIdentifier,
];

const HOME_RICH_TEXT_WIDGET_UNIVERSAL_IDENTIFIERS = [
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage.tabs.home.widgets
    .taskRichText.universalIdentifier,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage.tabs.home.widgets
    .noteRichText.universalIdentifier,
];

const REMOVED_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.task.fields.bodyV2.universalIdentifier,
  STANDARD_OBJECTS.task.fields.createdAt.universalIdentifier,
  STANDARD_OBJECTS.task.fields.createdBy.universalIdentifier,
  STANDARD_OBJECTS.task.fields.updatedAt.universalIdentifier,
  STANDARD_OBJECTS.task.fields.updatedBy.universalIdentifier,
  STANDARD_OBJECTS.note.fields.bodyV2.universalIdentifier,
  STANDARD_OBJECTS.note.fields.createdAt.universalIdentifier,
  STANDARD_OBJECTS.note.fields.createdBy.universalIdentifier,
  STANDARD_OBJECTS.note.fields.updatedAt.universalIdentifier,
  STANDARD_OBJECTS.note.fields.updatedBy.universalIdentifier,
];

@RegisteredWorkspaceCommand('2.38.0', 1788270000000)
@Command({
  name: 'upgrade:2-38:simplify-standard-task-note-layouts',
  description:
    'Simplify uncustomized standard task and note record pages to their home content',
})
export class SimplifyStandardTaskNoteLayoutsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would simplify uncustomized standard task and note layouts for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await dataSource.transaction(async (manager) => {
      const parameters = [
        workspaceId,
        twentyStandardFlatApplication.id,
        STANDARD_ACTIVITY_LAYOUT_UNIVERSAL_IDENTIFIERS,
      ];
      const eligibleLayouts = `
        SELECT layout.id
        FROM core."pageLayout" layout
        WHERE layout."workspaceId" = $1
          AND layout."applicationId" = $2
          AND layout."universalIdentifier" = ANY($3::uuid[])
          AND NOT EXISTS (
            SELECT 1 FROM core."pageLayoutTab" tab
            WHERE tab."pageLayoutId" = layout.id AND tab.overrides IS NOT NULL
          )
          AND NOT EXISTS (
            SELECT 1 FROM core."pageLayoutWidget" widget
            JOIN core."pageLayoutTab" tab ON tab.id = widget."pageLayoutTabId"
            WHERE tab."pageLayoutId" = layout.id AND widget.overrides IS NOT NULL
          )
          AND NOT EXISTS (
            SELECT 1 FROM core."pageLayoutWidget" widget
            JOIN core."pageLayoutTab" tab ON tab.id = widget."pageLayoutTabId"
            JOIN core."viewField" view_field ON view_field."viewId" = widget."viewId"
            WHERE tab."pageLayoutId" = layout.id AND view_field.overrides IS NOT NULL
          )
          AND NOT EXISTS (
            SELECT 1 FROM core."pageLayoutWidget" widget
            JOIN core."pageLayoutTab" tab ON tab.id = widget."pageLayoutTabId"
            JOIN core."viewFieldGroup" field_group ON field_group."viewId" = widget."viewId"
            WHERE tab."pageLayoutId" = layout.id AND field_group.overrides IS NOT NULL
          )`;

      await manager.query(
        `DELETE FROM core."pageLayoutTab"
         WHERE "pageLayoutId" IN (${eligibleLayouts})
           AND "applicationId" = $2
           AND "universalIdentifier" = ANY($4::uuid[])`,
        [...parameters, REMOVED_TAB_UNIVERSAL_IDENTIFIERS],
      );

      await manager.query(
        `UPDATE core."pageLayoutWidget" widget
         SET "conditionalDisplay" = NULL,
             "conditionalAvailabilityExpression" = NULL,
             "updatedAt" = now()
         FROM core."pageLayoutTab" tab
         WHERE widget."pageLayoutTabId" = tab.id
           AND tab."pageLayoutId" IN (${eligibleLayouts})
           AND widget."applicationId" = $2
           AND widget."universalIdentifier" = ANY($4::uuid[])`,
        [...parameters, HOME_RICH_TEXT_WIDGET_UNIVERSAL_IDENTIFIERS],
      );

      await manager.query(
        `DELETE FROM core."viewField" view_field
         USING core."view" view, core."pageLayoutWidget" widget,
               core."pageLayoutTab" tab, core."fieldMetadata" field
         WHERE view_field."viewId" = view.id
           AND widget."viewId" = view.id
           AND widget."pageLayoutTabId" = tab.id
           AND tab."pageLayoutId" IN (${eligibleLayouts})
           AND view_field."fieldMetadataId" = field.id
           AND view_field.overrides IS NULL
           AND field."universalIdentifier" = ANY($4::uuid[])`,
        [...parameters, REMOVED_FIELD_UNIVERSAL_IDENTIFIERS],
      );

      await manager.query(
        `DELETE FROM core."viewFieldGroup" field_group
         USING core."view" view, core."pageLayoutWidget" widget,
               core."pageLayoutTab" tab
         WHERE field_group."viewId" = view.id
           AND widget."viewId" = view.id
           AND widget."pageLayoutTabId" = tab.id
           AND tab."pageLayoutId" IN (${eligibleLayouts})
           AND field_group.overrides IS NULL
           AND NOT EXISTS (
             SELECT 1 FROM core."viewField" view_field
             WHERE view_field."viewFieldGroupId" = field_group.id
           )`,
        parameters,
      );
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
    ]);
  }
}
