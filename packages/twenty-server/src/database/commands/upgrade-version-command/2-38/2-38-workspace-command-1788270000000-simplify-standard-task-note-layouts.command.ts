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
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const TASK_LAYOUT_IDENTIFIERS =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.taskRecordPage;
const NOTE_LAYOUT_IDENTIFIERS =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.noteRecordPage;
const TASK_FIELDS_VIEW_IDENTIFIERS =
  STANDARD_OBJECTS.task.views.taskRecordPageFields;
const NOTE_FIELDS_VIEW_IDENTIFIERS =
  STANDARD_OBJECTS.note.views.noteRecordPageFields;

const TARGET_LAYOUTS = [
  {
    label: 'Task',
    pageLayoutUniversalIdentifier: TASK_LAYOUT_IDENTIFIERS.universalIdentifier,
    fieldsViewUniversalIdentifier:
      TASK_FIELDS_VIEW_IDENTIFIERS.universalIdentifier,
    allowedTabUniversalIdentifiers: Object.values(
      TASK_LAYOUT_IDENTIFIERS.tabs,
    ).map(({ universalIdentifier }) => universalIdentifier),
    allowedWidgetUniversalIdentifiers: Object.values(
      TASK_LAYOUT_IDENTIFIERS.tabs,
    ).flatMap(({ widgets }) =>
      Object.values(widgets).map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ),
    removedTabUniversalIdentifiers: [
      TASK_LAYOUT_IDENTIFIERS.tabs.timeline.universalIdentifier,
      TASK_LAYOUT_IDENTIFIERS.tabs.files.universalIdentifier,
    ],
    allowedViewFieldUniversalIdentifiers: Object.values(
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFields,
    ).map(({ universalIdentifier }) => universalIdentifier),
    removedViewFieldUniversalIdentifiers: [
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFields.bodyV2.universalIdentifier,
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFields.createdAt.universalIdentifier,
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFields.createdBy.universalIdentifier,
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFields.updatedAt.universalIdentifier,
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFields.updatedBy.universalIdentifier,
    ],
    allowedViewFieldGroupUniversalIdentifiers: Object.values(
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFieldGroups,
    ).map(({ universalIdentifier }) => universalIdentifier),
    removedViewFieldGroupUniversalIdentifiers: [
      TASK_FIELDS_VIEW_IDENTIFIERS.viewFieldGroups.system.universalIdentifier,
    ],
  },
  {
    label: 'Note',
    pageLayoutUniversalIdentifier: NOTE_LAYOUT_IDENTIFIERS.universalIdentifier,
    fieldsViewUniversalIdentifier:
      NOTE_FIELDS_VIEW_IDENTIFIERS.universalIdentifier,
    allowedTabUniversalIdentifiers: Object.values(
      NOTE_LAYOUT_IDENTIFIERS.tabs,
    ).map(({ universalIdentifier }) => universalIdentifier),
    allowedWidgetUniversalIdentifiers: Object.values(
      NOTE_LAYOUT_IDENTIFIERS.tabs,
    ).flatMap(({ widgets }) =>
      Object.values(widgets).map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ),
    removedTabUniversalIdentifiers: [
      NOTE_LAYOUT_IDENTIFIERS.tabs.timeline.universalIdentifier,
      NOTE_LAYOUT_IDENTIFIERS.tabs.files.universalIdentifier,
    ],
    allowedViewFieldUniversalIdentifiers: Object.values(
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFields,
    ).map(({ universalIdentifier }) => universalIdentifier),
    removedViewFieldUniversalIdentifiers: [
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFields.bodyV2.universalIdentifier,
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFields.createdAt.universalIdentifier,
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFields.createdBy.universalIdentifier,
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFields.updatedAt.universalIdentifier,
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFields.updatedBy.universalIdentifier,
    ],
    allowedViewFieldGroupUniversalIdentifiers: Object.values(
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFieldGroups,
    ).map(({ universalIdentifier }) => universalIdentifier),
    removedViewFieldGroupUniversalIdentifiers: [
      NOTE_FIELDS_VIEW_IDENTIFIERS.viewFieldGroups.system.universalIdentifier,
    ],
  },
] as const;

type OverridableFlatEntity = {
  applicationId: string;
  isActive: boolean;
  overrides: unknown;
};

const hasWorkspaceCustomization = (
  flatEntity: OverridableFlatEntity,
  standardApplicationId: string,
) =>
  flatEntity.applicationId !== standardApplicationId ||
  isDefined(flatEntity.overrides) ||
  !flatEntity.isActive;

const includesUniversalIdentifier = (
  universalIdentifiers: readonly string[],
  universalIdentifier: string,
) =>
  universalIdentifiers.some(
    (allowedUniversalIdentifier) =>
      allowedUniversalIdentifier === universalIdentifier,
  );

@RegisteredWorkspaceCommand('2.38.0', 1788270000000)
@Command({
  name: 'upgrade:2-38:simplify-standard-task-note-layouts',
  description: 'Simplify uncustomized standard task and note record pages',
})
export class SimplifyStandardTaskNoteLayoutsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const {
      flatPageLayoutMaps,
      flatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps,
      flatViewMaps,
      flatViewFieldMaps,
      flatViewFieldGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatPageLayoutMaps',
      'flatPageLayoutTabMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewMaps',
      'flatViewFieldMaps',
      'flatViewFieldGroupMaps',
    ]);

    const pageLayoutTabsToDelete: FlatPageLayoutTab[] = [];
    const viewFieldsToDelete: FlatViewField[] = [];
    const viewFieldGroupsToDelete: FlatViewFieldGroup[] = [];

    for (const targetLayout of TARGET_LAYOUTS) {
      const existingPageLayout =
        flatPageLayoutMaps.byUniversalIdentifier[
          targetLayout.pageLayoutUniversalIdentifier
        ];
      const existingFieldsView =
        flatViewMaps.byUniversalIdentifier[
          targetLayout.fieldsViewUniversalIdentifier
        ];

      if (!isDefined(existingPageLayout) || !isDefined(existingFieldsView)) {
        this.logger.log(
          `${targetLayout.label} record page metadata is incomplete for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      const existingTabs = existingPageLayout.tabUniversalIdentifiers.map(
        (universalIdentifier) =>
          flatPageLayoutTabMaps.byUniversalIdentifier[universalIdentifier],
      );
      const existingWidgets = existingTabs.flatMap((tab) =>
        isDefined(tab)
          ? tab.widgetUniversalIdentifiers.map(
              (universalIdentifier) =>
                flatPageLayoutWidgetMaps.byUniversalIdentifier[
                  universalIdentifier
                ],
            )
          : [],
      );
      const existingViewFields =
        existingFieldsView.viewFieldUniversalIdentifiers.map(
          (universalIdentifier) =>
            flatViewFieldMaps.byUniversalIdentifier[universalIdentifier],
        );
      const existingViewFieldGroups =
        existingFieldsView.viewFieldGroupUniversalIdentifiers.map(
          (universalIdentifier) =>
            flatViewFieldGroupMaps.byUniversalIdentifier[universalIdentifier],
        );

      const hasMissingChildMetadata = [
        ...existingTabs,
        ...existingWidgets,
        ...existingViewFields,
        ...existingViewFieldGroups,
      ].some((flatEntity) => !isDefined(flatEntity));
      const hasCustomChildIdentifiers =
        existingPageLayout.tabUniversalIdentifiers.some(
          (universalIdentifier) =>
            !includesUniversalIdentifier(
              targetLayout.allowedTabUniversalIdentifiers,
              universalIdentifier,
            ),
        ) ||
        existingWidgets.some(
          (widget) =>
            isDefined(widget) &&
            !includesUniversalIdentifier(
              targetLayout.allowedWidgetUniversalIdentifiers,
              widget.universalIdentifier,
            ),
        ) ||
        existingFieldsView.viewFieldUniversalIdentifiers.some(
          (universalIdentifier) =>
            !includesUniversalIdentifier(
              targetLayout.allowedViewFieldUniversalIdentifiers,
              universalIdentifier,
            ),
        ) ||
        existingFieldsView.viewFieldGroupUniversalIdentifiers.some(
          (universalIdentifier) =>
            !includesUniversalIdentifier(
              targetLayout.allowedViewFieldGroupUniversalIdentifiers,
              universalIdentifier,
            ),
        );
      const hasCustomizedMetadata = [
        ...existingTabs,
        ...existingWidgets,
        existingFieldsView,
        ...existingViewFields,
        ...existingViewFieldGroups,
      ].some(
        (flatEntity) =>
          isDefined(flatEntity) &&
          hasWorkspaceCustomization(
            flatEntity,
            twentyStandardFlatApplication.id,
          ),
      );
      const hasFieldsViewConfiguration =
        existingFieldsView.viewFilterUniversalIdentifiers.length > 0 ||
        existingFieldsView.viewFilterGroupUniversalIdentifiers.length > 0 ||
        existingFieldsView.viewGroupUniversalIdentifiers.length > 0 ||
        existingFieldsView.viewSortUniversalIdentifiers.length > 0;

      if (
        existingPageLayout.applicationId !== twentyStandardFlatApplication.id ||
        hasMissingChildMetadata ||
        hasCustomChildIdentifiers ||
        hasCustomizedMetadata ||
        hasFieldsViewConfiguration
      ) {
        this.logger.log(
          `${targetLayout.label} record page is customized for workspace ${workspaceId}, skipping`,
        );

        continue;
      }

      pageLayoutTabsToDelete.push(
        ...targetLayout.removedTabUniversalIdentifiers
          .map(
            (universalIdentifier) =>
              flatPageLayoutTabMaps.byUniversalIdentifier[universalIdentifier],
          )
          .filter((tab): tab is FlatPageLayoutTab => isDefined(tab)),
      );
      viewFieldsToDelete.push(
        ...targetLayout.removedViewFieldUniversalIdentifiers
          .map(
            (universalIdentifier) =>
              flatViewFieldMaps.byUniversalIdentifier[universalIdentifier],
          )
          .filter((viewField): viewField is FlatViewField =>
            isDefined(viewField),
          ),
      );
      viewFieldGroupsToDelete.push(
        ...targetLayout.removedViewFieldGroupUniversalIdentifiers
          .map(
            (universalIdentifier) =>
              flatViewFieldGroupMaps.byUniversalIdentifier[universalIdentifier],
          )
          .filter((viewFieldGroup): viewFieldGroup is FlatViewFieldGroup =>
            isDefined(viewFieldGroup),
          ),
      );
    }

    const totalOperationCount =
      pageLayoutTabsToDelete.length +
      viewFieldsToDelete.length +
      viewFieldGroupsToDelete.length;

    if (totalOperationCount === 0) {
      this.logger.log(
        `Standard task and note record pages already up to date or customized for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Applying ${totalOperationCount} standard task and note record page operation(s) for workspace ${workspaceId}`,
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
              flatEntityToCreate: [],
              flatEntityToDelete: pageLayoutTabsToDelete,
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
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateAndBuildResult);
    }

    this.logger.log(
      `Simplified the standard task and note record pages for workspace ${workspaceId}`,
    );
  }
}
