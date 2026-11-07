import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useDashboardFilters } from '@/page-layout/hooks/useDashboardFilters';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type WidgetDashboardFilter } from '@/page-layout/types/WidgetDashboardFilter';
import { computeDashboardFilterForWidget } from '@/page-layout/utils/computeDashboardFilterForWidget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const NO_WIDGET_DASHBOARD_FILTER: WidgetDashboardFilter = {
  boundDashboardFilterValues: [],
  recordFilters: [],
  isInvalid: false,
};

export const useDashboardFilterForWidget = ({
  objectMetadataId,
  configuration,
}: Pick<
  PageLayoutWidget,
  'objectMetadataId' | 'configuration'
>): WidgetDashboardFilter => {
  const dashboardFilters = useDashboardFilters();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const bindings =
    'dashboardFilterBindings' in configuration
      ? configuration.dashboardFilterBindings
      : undefined;

  const fields = isDefined(objectMetadataId)
    ? objectMetadataItemsByIdMap.get(objectMetadataId)?.fields
    : undefined;

  return useMemo(() => {
    if (!isDefined(dashboardFilters) || !isNonEmptyArray(bindings)) {
      return NO_WIDGET_DASHBOARD_FILTER;
    }

    return computeDashboardFilterForWidget({
      values: dashboardFilters.valueByPageLayoutFilterId,
      bindings,
      fields: fields ?? [],
      timeZone: dashboardFilters.timeZone,
      firstDayOfTheWeek: dashboardFilters.firstDayOfTheWeek,
    });
  }, [dashboardFilters, bindings, fields]);
};
