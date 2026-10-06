import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { BUILT_IN_DASHBOARD_FILTER_SLOT_DEFINITIONS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlotDefinitions';
import { type DashboardFilterSlotDefinitionsAndBindings } from '@/page-layout/dashboard-filters/types/DashboardFilterSlotDefinitionsAndBindings';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetType } from '~/generated-metadata/graphql';

// A slot nobody binds does not exist: a value left for it in state or URL must not reach any chart nor flag them.
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

  const slotDefinitions = BUILT_IN_DASHBOARD_FILTER_SLOT_DEFINITIONS.map(
    ({ slot }) => slot,
  ).filter((slot) =>
    Object.values(candidateBindingsByWidgetId).some((bindingsBySlotId) =>
      isDefined(bindingsBySlotId[slot.id]),
    ),
  );

  const existingSlotIds = new Set(slotDefinitions.map((slot) => slot.id));

  const bindingsByWidgetId = Object.fromEntries(
    Object.entries(candidateBindingsByWidgetId).map(
      ([widgetId, bindingsBySlotId]) => [
        widgetId,
        Object.fromEntries(
          Object.entries(bindingsBySlotId).filter(([slotId]) =>
            existingSlotIds.has(slotId),
          ),
        ),
      ],
    ),
  );

  return { slotDefinitions, bindingsByWidgetId };
};
