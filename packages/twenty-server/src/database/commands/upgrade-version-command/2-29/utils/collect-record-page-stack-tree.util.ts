import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

type FlatPageLayoutFromMaps = NonNullable<
  AllFlatEntityMaps['flatPageLayoutMaps']['byUniversalIdentifier'][string]
>;
type FlatPageLayoutTabFromMaps = NonNullable<
  AllFlatEntityMaps['flatPageLayoutTabMaps']['byUniversalIdentifier'][string]
>;
type FlatPageLayoutWidgetFromMaps = NonNullable<
  AllFlatEntityMaps['flatPageLayoutWidgetMaps']['byUniversalIdentifier'][string]
>;
type FlatViewFromMaps = NonNullable<
  AllFlatEntityMaps['flatViewMaps']['byUniversalIdentifier'][string]
>;
type FlatViewFieldFromMaps = NonNullable<
  AllFlatEntityMaps['flatViewFieldMaps']['byUniversalIdentifier'][string]
>;
type FlatViewFieldGroupFromMaps = NonNullable<
  AllFlatEntityMaps['flatViewFieldGroupMaps']['byUniversalIdentifier'][string]
>;

export type RecordPageStackFieldsViewNode = {
  flatView: FlatViewFromMaps;
  flatViewFields: FlatViewFieldFromMaps[];
  flatViewFieldGroups: FlatViewFieldGroupFromMaps[];
};

export type RecordPageStackWidgetNode = {
  flatPageLayoutWidget: FlatPageLayoutWidgetFromMaps;
  // Set on FIELDS widgets whose configured view resolves; a FIELDS widget with
  // a dangling or absent view keeps fieldsWidgetViewId for the caller to
  // report. The same view can appear under several FIELDS widgets of one
  // stack: consumers dedup by view id.
  fieldsWidgetViewId?: string | null;
  fieldsView?: RecordPageStackFieldsViewNode;
};

export type RecordPageStackTabNode = {
  flatPageLayoutTab: FlatPageLayoutTabFromMaps;
  widgets: RecordPageStackWidgetNode[];
};

export type RecordPageStackTree = {
  flatPageLayout: FlatPageLayoutFromMaps;
  tabs: RecordPageStackTabNode[];
};

// Single traversal of one record-page stack: layout, active tabs, active
// widgets, and each FIELDS widget's resolved view with its active view fields
// and groups. Soft-deleted rows are excluded at every level. Consumers apply
// their own ownership filtering and dedup on top.
export const collectRecordPageStackTree = ({
  flatPageLayout,
  flatViewMaps,
  flatViewFieldMaps,
  flatViewFieldGroupMaps,
  flatPageLayoutTabMaps,
  flatPageLayoutWidgetMaps,
}: {
  flatPageLayout: FlatPageLayoutFromMaps;
} & Pick<
  AllFlatEntityMaps,
  | 'flatViewMaps'
  | 'flatViewFieldMaps'
  | 'flatViewFieldGroupMaps'
  | 'flatPageLayoutTabMaps'
  | 'flatPageLayoutWidgetMaps'
>): RecordPageStackTree => {
  const tabs: RecordPageStackTabNode[] = [];

  for (const tabUniversalIdentifier of flatPageLayout.tabUniversalIdentifiers) {
    const flatPageLayoutTab =
      flatPageLayoutTabMaps.byUniversalIdentifier[tabUniversalIdentifier];

    if (
      !isDefined(flatPageLayoutTab) ||
      isDefined(flatPageLayoutTab.deletedAt)
    ) {
      continue;
    }

    const widgets: RecordPageStackWidgetNode[] = [];

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

      if (
        flatPageLayoutWidget.configuration?.configurationType !==
        WidgetConfigurationType.FIELDS
      ) {
        widgets.push({ flatPageLayoutWidget });
        continue;
      }

      const fieldsWidgetViewId = flatPageLayoutWidget.configuration.viewId;
      const viewUniversalIdentifier = isDefined(fieldsWidgetViewId)
        ? flatViewMaps.universalIdentifierById[fieldsWidgetViewId]
        : undefined;
      const flatView = isDefined(viewUniversalIdentifier)
        ? flatViewMaps.byUniversalIdentifier[viewUniversalIdentifier]
        : undefined;

      if (!isDefined(flatView) || isDefined(flatView.deletedAt)) {
        widgets.push({ flatPageLayoutWidget, fieldsWidgetViewId });
        continue;
      }

      widgets.push({
        flatPageLayoutWidget,
        fieldsWidgetViewId,
        fieldsView: {
          flatView,
          flatViewFields: flatView.viewFieldUniversalIdentifiers
            .map(
              (viewFieldUniversalIdentifier) =>
                flatViewFieldMaps.byUniversalIdentifier[
                  viewFieldUniversalIdentifier
                ],
            )
            .filter(isDefined)
            .filter((flatViewField) => !isDefined(flatViewField.deletedAt)),
          flatViewFieldGroups: flatView.viewFieldGroupUniversalIdentifiers
            .map(
              (viewFieldGroupUniversalIdentifier) =>
                flatViewFieldGroupMaps.byUniversalIdentifier[
                  viewFieldGroupUniversalIdentifier
                ],
            )
            .filter(isDefined)
            .filter(
              (flatViewFieldGroup) =>
                !isDefined(flatViewFieldGroup.deletedAt),
            ),
        },
      });
    }

    tabs.push({ flatPageLayoutTab, widgets });
  }

  return { flatPageLayout, tabs };
};
