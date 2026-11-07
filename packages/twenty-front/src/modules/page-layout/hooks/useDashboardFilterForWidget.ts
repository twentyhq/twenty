import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useDashboardFilterValues } from '@/page-layout/hooks/useDashboardFilterValues';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { computeDashboardFilterForWidget } from '@/page-layout/utils/computeDashboardFilterForWidget';
import { useUserFirstDayOfTheWeek } from '@/ui/input/components/internal/date/hooks/useUserFirstDayOfTheWeek';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  computeRecordGqlOperationFilter,
  isNonEmptyArray,
} from 'twenty-shared/utils';

export const useDashboardFilterForWidget = ({
  objectMetadataItem,
  configuration,
}: {
  objectMetadataItem:
    | Pick<EnrichedObjectMetadataItem, 'readableFields'>
    | undefined;
  configuration: PageLayoutWidget['configuration'];
}) => {
  const { dashboardFilterValueById } = useDashboardFilterValues();

  // Same time zone source as useFilterValueDependencies, so every path agrees
  const { userTimezone } = useUserTimezone();
  const { userFirstDayOfTheWeek } = useUserFirstDayOfTheWeek();
  const { filterValueDependencies } = useFilterValueDependencies();

  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );

  const dashboardFilter = computeDashboardFilterForWidget({
    values: dashboardFilterValueById,
    bindings:
      'dashboardFilterBindings' in configuration
        ? configuration.dashboardFilterBindings
        : undefined,
    fields: objectMetadataItem?.readableFields ?? [],
    timeZone: userTimezone,
    firstDayOfTheWeek: userFirstDayOfTheWeek,
  });

  return {
    ...dashboardFilter,
    dashboardChartDataInput: isNonEmptyArray(
      dashboardFilter.boundDashboardFilterValues,
    )
      ? {
          dashboardFilterValues: dashboardFilter.boundDashboardFilterValues,
          dashboardFilterTimeZone: userTimezone,
        }
      : {},
    dashboardGqlOperationFilter: computeRecordGqlOperationFilter({
      fieldMetadataItems: flattenedFieldMetadataItems,
      filterValueDependencies,
      recordFilters: dashboardFilter.recordFilters,
      recordFilterGroups: [],
    }),
  };
};
