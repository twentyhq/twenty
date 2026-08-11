import { isDefined } from 'twenty-shared/utils';

import { collectRecordPageStackTree } from 'src/database/commands/upgrade-version-command/2-31/utils/collect-record-page-stack-tree.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

type ApplicationOwnedFlatEntity = {
  id: string;
  applicationUniversalIdentifier: string;
};

export type RecordPageStackFlatEntities = {
  pageLayouts: ApplicationOwnedFlatEntity[];
  pageLayoutTabs: ApplicationOwnedFlatEntity[];
  pageLayoutWidgets: ApplicationOwnedFlatEntity[];
  views: ApplicationOwnedFlatEntity[];
  viewFields: ApplicationOwnedFlatEntity[];
  viewFieldGroups: ApplicationOwnedFlatEntity[];
};

// Collect one record-page stack (layout, tabs, widgets, the FIELDS widget
// views, their view fields and groups) as raw rows, soft-deleted excluded.
// Used by the standard reconcile command to de-own the 1-23-era stacks of
// workspace-custom objects, which were authored under twenty-standard.
export const collectRecordPageStackFlatEntities = ({
  flatPageLayout,
  flatViewMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatPageLayoutTabMaps,
  flatPageLayoutWidgetMaps,
}: {
  flatPageLayout: NonNullable<
    AllFlatEntityMaps['flatPageLayoutMaps']['byUniversalIdentifier'][string]
  >;
} & Pick<
  AllFlatEntityMaps,
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatPageLayoutTabMaps'
  | 'flatPageLayoutWidgetMaps'
>): RecordPageStackFlatEntities => {
  const stackTree = collectRecordPageStackTree({
    flatPageLayout,
    flatViewMaps,
    flatViewFieldMaps,
    flatViewFieldGroupMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
  });

  const stack: RecordPageStackFlatEntities = {
    pageLayouts: [flatPageLayout],
    pageLayoutTabs: [],
    pageLayoutWidgets: [],
    views: [],
    viewFields: [],
    viewFieldGroups: [],
  };

  for (const { flatPageLayoutTab, widgets } of stackTree.tabs) {
    stack.pageLayoutTabs.push(flatPageLayoutTab);

    for (const { flatPageLayoutWidget, fieldsView } of widgets) {
      stack.pageLayoutWidgets.push(flatPageLayoutWidget);

      if (
        !isDefined(fieldsView) ||
        stack.views.some((view) => view.id === fieldsView.flatView.id)
      ) {
        continue;
      }

      stack.views.push(fieldsView.flatView);
      stack.viewFields.push(...fieldsView.flatViewFields);
      stack.viewFieldGroups.push(...fieldsView.flatViewFieldGroups);
    }
  }

  return stack;
};
