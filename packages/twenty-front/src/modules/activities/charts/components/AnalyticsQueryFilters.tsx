import { AnalyticsQueryFilter } from '@/activities/charts/components/AnalyticsQueryFilter';
import { AnalyticsQuery } from '@/activities/charts/types/AnalyticsQuery';

interface AnalyticsQueryFiltersProps {
  analyticsQuery?: AnalyticsQuery;
}

export const AnalyticsQueryFilters = (props: AnalyticsQueryFiltersProps) =>
  props.analyticsQuery?.analyticsQueryFilters?.map((analytcsQueryFilter) => (
    <AnalyticsQueryFilter analyticsQueryFilter={analytcsQueryFilter} />
  ));
