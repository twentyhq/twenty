import { isDefined } from 'twenty-shared/utils';

import {
  STANDARD_TASK_NOTE_LAYOUT_MIGRATION_TARGETS,
  type StandardTaskNoteLayoutMigrationTarget,
} from 'src/database/commands/upgrade-version-command/2-38/constants/standard-task-note-layout-migration-targets.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export type TaskNoteLayoutMigrationFlatMaps = Pick<
  AllFlatEntityMaps,
  | 'flatPageLayoutMaps'
  | 'flatPageLayoutTabMaps'
  | 'flatPageLayoutWidgetMaps'
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
>;

type OverridableFlatEntity = {
  applicationId: string;
  isActive: boolean;
  overrides: unknown;
};

type SkippedLayout = {
  label: StandardTaskNoteLayoutMigrationTarget['label'];
  reason: 'customized' | 'incomplete';
};

export type StandardTaskNoteLayoutMigrationOperations = {
  pageLayoutTabsToDelete: FlatPageLayoutTab[];
  viewFieldsToDelete: FlatViewField[];
  viewFieldGroupsToDelete: FlatViewFieldGroup[];
  skippedLayouts: SkippedLayout[];
};

const hasWorkspaceCustomization = (
  flatEntity: OverridableFlatEntity,
  standardApplicationId: string,
) =>
  flatEntity.applicationId !== standardApplicationId ||
  isDefined(flatEntity.overrides) ||
  !flatEntity.isActive;

const hasSameUniversalIdentifiers = (
  actualUniversalIdentifiers: readonly string[],
  expectedUniversalIdentifiers: readonly string[],
) =>
  actualUniversalIdentifiers.length === expectedUniversalIdentifiers.length &&
  actualUniversalIdentifiers.every((universalIdentifier) =>
    expectedUniversalIdentifiers.includes(universalIdentifier),
  );

const matchesExpectedMigrationState = ({
  targetLayout,
  tabUniversalIdentifiers,
  widgetUniversalIdentifiers,
  viewFieldUniversalIdentifiers,
  viewFieldGroupUniversalIdentifiers,
}: {
  targetLayout: StandardTaskNoteLayoutMigrationTarget;
  tabUniversalIdentifiers: readonly string[];
  widgetUniversalIdentifiers: readonly string[];
  viewFieldUniversalIdentifiers: readonly string[];
  viewFieldGroupUniversalIdentifiers: readonly string[];
}) => {
  const matchesState = (state: 'preMigration' | 'postMigration') =>
    hasSameUniversalIdentifiers(
      tabUniversalIdentifiers,
      targetLayout[`${state}TabUniversalIdentifiers`],
    ) &&
    hasSameUniversalIdentifiers(
      widgetUniversalIdentifiers,
      targetLayout[`${state}WidgetUniversalIdentifiers`],
    ) &&
    hasSameUniversalIdentifiers(
      viewFieldUniversalIdentifiers,
      targetLayout[`${state}ViewFieldUniversalIdentifiers`],
    ) &&
    hasSameUniversalIdentifiers(
      viewFieldGroupUniversalIdentifiers,
      targetLayout[`${state}ViewFieldGroupUniversalIdentifiers`],
    );

  return matchesState('preMigration') || matchesState('postMigration');
};

export const computeStandardTaskNoteLayoutMigrationOperations = ({
  flatMaps: {
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
  },
  standardApplicationId,
}: {
  flatMaps: TaskNoteLayoutMigrationFlatMaps;
  standardApplicationId: string;
}): StandardTaskNoteLayoutMigrationOperations => {
  const pageLayoutTabsToDelete: FlatPageLayoutTab[] = [];
  const viewFieldsToDelete: FlatViewField[] = [];
  const viewFieldGroupsToDelete: FlatViewFieldGroup[] = [];
  const skippedLayouts: SkippedLayout[] = [];

  for (const targetLayout of STANDARD_TASK_NOTE_LAYOUT_MIGRATION_TARGETS) {
    const existingPageLayout =
      flatPageLayoutMaps.byUniversalIdentifier[
        targetLayout.pageLayoutUniversalIdentifier
      ];
    const existingFieldsView =
      flatViewMaps.byUniversalIdentifier[
        targetLayout.fieldsViewUniversalIdentifier
      ];

    if (!isDefined(existingPageLayout) || !isDefined(existingFieldsView)) {
      skippedLayouts.push({ label: targetLayout.label, reason: 'incomplete' });

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
    const allExistingChildren = [
      ...existingTabs,
      ...existingWidgets,
      ...existingViewFields,
      ...existingViewFieldGroups,
    ];

    if (allExistingChildren.some((flatEntity) => !isDefined(flatEntity))) {
      skippedLayouts.push({ label: targetLayout.label, reason: 'incomplete' });

      continue;
    }

    const definedExistingTabs = existingTabs.filter(isDefined);
    const definedExistingWidgets = existingWidgets.filter(isDefined);
    const definedExistingViewFields = existingViewFields.filter(isDefined);
    const definedExistingViewFieldGroups =
      existingViewFieldGroups.filter(isDefined);
    const hasExpectedChildSets = matchesExpectedMigrationState({
      targetLayout,
      tabUniversalIdentifiers: existingPageLayout.tabUniversalIdentifiers,
      widgetUniversalIdentifiers: definedExistingWidgets.map(
        (widget) => widget.universalIdentifier,
      ),
      viewFieldUniversalIdentifiers:
        existingFieldsView.viewFieldUniversalIdentifiers,
      viewFieldGroupUniversalIdentifiers:
        existingFieldsView.viewFieldGroupUniversalIdentifiers,
    });
    const hasCustomizedMetadata = [
      ...definedExistingTabs,
      ...definedExistingWidgets,
      existingFieldsView,
      ...definedExistingViewFields,
      ...definedExistingViewFieldGroups,
    ].some((flatEntity) =>
      hasWorkspaceCustomization(flatEntity, standardApplicationId),
    );
    const hasFieldsViewConfiguration =
      existingFieldsView.viewFilterUniversalIdentifiers.length > 0 ||
      existingFieldsView.viewFilterGroupUniversalIdentifiers.length > 0 ||
      existingFieldsView.viewGroupUniversalIdentifiers.length > 0 ||
      existingFieldsView.viewSortUniversalIdentifiers.length > 0;

    if (
      existingPageLayout.applicationId !== standardApplicationId ||
      !hasExpectedChildSets ||
      hasCustomizedMetadata ||
      hasFieldsViewConfiguration
    ) {
      skippedLayouts.push({ label: targetLayout.label, reason: 'customized' });

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

  return {
    pageLayoutTabsToDelete,
    viewFieldsToDelete,
    viewFieldGroupsToDelete,
    skippedLayouts,
  };
};
