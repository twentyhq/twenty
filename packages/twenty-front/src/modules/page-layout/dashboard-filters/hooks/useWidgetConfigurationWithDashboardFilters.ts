import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfTypeGraph } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { type ChartFilter } from 'twenty-shared/types';
import { buildRecordFiltersFromDashboardFilters } from 'twenty-shared/utils';

// Returns the widget's own configuration reference when nothing applies, so downstream memos stay stable.
export const useWidgetConfigurationWithDashboardFilters = (
  widget: PageLayoutWidget,
): PageLayoutWidget['configuration'] => {
  const { slots, bindingsByWidgetId } = useDashboardFilterSlots();

  const dashboardFilterValues = useAtomComponentStateValue(
    dashboardFilterValuesComponentState,
  );

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  // "Me" on a slot bound to a chart's own id has to become that member's id before the UUID filter is built.
  const {
    filterValueDependencies: { currentWorkspaceMemberId, timeZone },
  } = useFilterValueDependencies();

  const widgetId = widget.id;
  const configuration = widget.configuration;
  const bindings = bindingsByWidgetId[widgetId];

  return useMemo(() => {
    if (!isWidgetConfigurationOfTypeGraph(configuration)) {
      return configuration;
    }

    const dashboardRecordFilters = buildRecordFiltersFromDashboardFilters({
      slots,
      values: dashboardFilterValues,
      bindings,
      fieldMetadataItems: flattenedFieldMetadataItems,
      currentWorkspaceMemberId,
    });

    if (dashboardRecordFilters.length === 0) {
      return configuration;
    }

    const existingFilter: ChartFilter = configuration.filter ?? {};

    // Bar, line and pie resolve day-based operands (IS_TODAY, IS <date>) server-side in the stored timezone,
    // which is the editor's at creation time, while aggregate charts resolve them client-side in the viewer's.
    // A dashboard filter is the viewer's choice, so the merged copy sent to the server carries the viewer's
    // timezone; the stored configuration and the draft keep the widget's own.
    return {
      ...configuration,
      timezone: timeZone,
      filter: {
        ...existingFilter,
        recordFilters: [
          ...(existingFilter.recordFilters ?? []),
          ...dashboardRecordFilters,
        ],
      },
    };
  }, [
    configuration,
    slots,
    dashboardFilterValues,
    bindings,
    flattenedFieldMetadataItems,
    currentWorkspaceMemberId,
    timeZone,
  ]);
};
