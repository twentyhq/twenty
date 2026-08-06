import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

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
  const stack: RecordPageStackFlatEntities = {
    pageLayouts: [flatPageLayout],
    pageLayoutTabs: [],
    pageLayoutWidgets: [],
    views: [],
    viewFields: [],
    viewFieldGroups: [],
  };

  for (const tabUniversalIdentifier of flatPageLayout.tabUniversalIdentifiers) {
    const flatPageLayoutTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[tabUniversalIdentifier];

    if (
      !isDefined(flatPageLayoutTab) ||
      isDefined(flatPageLayoutTab.deletedAt)
    ) {
      continue;
    }

    stack.pageLayoutTabs.push(flatPageLayoutTab);

    for (const widgetUniversalIdentifier of flatPageLayoutTab.widgetUniversalIdentifiers) {
      const flatPageLayoutWidget =
        flatPageLayoutWidgetMaps.byUniversalIdentifier[
          widgetUniversalIdentifier
        ];

      if (
        !isDefined(flatPageLayoutWidget) ||
        isDefined(flatPageLayoutWidget.deletedAt)
      ) {
        continue;
      }

      stack.pageLayoutWidgets.push(flatPageLayoutWidget);

      if (
        flatPageLayoutWidget.configuration?.configurationType !==
        WidgetConfigurationType.FIELDS
      ) {
        continue;
      }

      const fieldsWidgetViewId = flatPageLayoutWidget.configuration.viewId;
      const viewUniversalIdentifier = isDefined(fieldsWidgetViewId)
        ? flatViewMaps.universalIdentifierById[fieldsWidgetViewId]
        : undefined;
      const flatView = isDefined(viewUniversalIdentifier)
        ? flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]
        : undefined;

      if (
        !isDefined(flatView) ||
        isDefined(flatView.deletedAt) ||
        stack.views.some((view) => view.id === flatView.id)
      ) {
        continue;
      }

      stack.views.push(flatView);

      for (const viewFieldUniversalIdentifier of flatView.viewFieldUniversalIdentifiers) {
        const flatViewField =
          flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier];

        if (isDefined(flatViewField) && !isDefined(flatViewField.deletedAt)) {
          stack.viewFields.push(flatViewField);
        }
      }

      for (const viewFieldGroupUniversalIdentifier of flatView.viewFieldGroupUniversalIdentifiers) {
        const flatViewFieldGroup =
          flatViewFieldGroupMaps.byUniversalIdentifier[
            viewFieldGroupUniversalIdentifier
          ];

        if (
          isDefined(flatViewFieldGroup) &&
          !isDefined(flatViewFieldGroup.deletedAt)
        ) {
          stack.viewFieldGroups.push(flatViewFieldGroup);
        }
      }
    }
  }

  return stack;
};
