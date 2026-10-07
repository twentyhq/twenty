import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { useCurrentWidgetOrNull } from '@/page-layout/widgets/hooks/useCurrentWidgetOrNull';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import {
  buildRecordFiltersFromDashboardFilters,
  isDefined,
  type RecordFilter,
} from 'twenty-shared/utils';

const NO_RECORD_FILTERS: RecordFilter[] = [];

// Read-only at query time: the widget's stored configuration is never touched, so edit mode keeps showing its own filters.
export const useDashboardFilterRecordFilters = (): {
  dashboardFilterRecordFilters: RecordFilter[];
} => {
  const currentWidget = useCurrentWidgetOrNull();

  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const currentWidgetBindings = isDefined(currentWidget)
    ? bindingsByWidgetId[currentWidget.id]
    : undefined;

  const dashboardFilterRecordFilters = useMemo(() => {
    if (slots.length === 0 || !isDefined(currentWidgetBindings)) {
      return NO_RECORD_FILTERS;
    }

    return buildRecordFiltersFromDashboardFilters({
      slots,
      values: dashboardFilterValues,
      bindings: currentWidgetBindings,
      fieldMetadataItems: flattenedFieldMetadataItems,
    });
  }, [
    slots,
    currentWidgetBindings,
    dashboardFilterValues,
    flattenedFieldMetadataItems,
  ]);

  return { dashboardFilterRecordFilters };
};
