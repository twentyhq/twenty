import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { BUILT_IN_DASHBOARD_FILTER_SLOT_DEFINITIONS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotDefinitions';
import { type DashboardFilterSlotDefinitionsAndBindings } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinitionsAndBindings';
import { pruneUnboundDashboardFilterSlotsAndBindings } from '@/page-layout/dashboard-filters/utils/pruneUnboundDashboardFilterSlotsAndBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

export const computeBuiltInDashboardFilterSlotsAndBindings = ({
  widgets,
  objectMetadataItems,
}: {
  widgets: PageLayoutWidget[];
  objectMetadataItems: Pick<EnrichedObjectMetadataItem, 'id' | 'fields'>[];
}): DashboardFilterSlotDefinitionsAndBindings => {
  const candidateBindingsByWidgetId = Object.fromEntries(
    widgets
      .filter((widget) => widget.type === WidgetType.GRAPH)
      .map((widget) => {
        const fields =
          objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.id === widget.objectMetadataId,
          )?.fields ?? [];

        return [
          widget.id,
          Object.fromEntries(
            BUILT_IN_DASHBOARD_FILTER_SLOT_DEFINITIONS.map(
              ({
                slot,
                pickField,
              }): [string, DashboardFilterBinding | null] => {
                const pickedField = pickField(fields);

                return [
                  slot.id,
                  isDefined(pickedField)
                    ? { fieldMetadataId: pickedField.id }
                    : null,
                ];
              },
            ),
          ),
        ];
      }),
  );

  return pruneUnboundDashboardFilterSlotsAndBindings({
    slots: BUILT_IN_DASHBOARD_FILTER_SLOT_DEFINITIONS.map(({ slot }) => slot),
    candidateBindingsByWidgetId,
  });
};
