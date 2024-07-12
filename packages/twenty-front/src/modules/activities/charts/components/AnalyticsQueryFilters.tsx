import { AnalyticsQueryFilter } from '@/activities/reports/components/AnalyticsQueryFilter';
import { AnalyticsQuery } from '@/activities/reports/types/AnalyticsQuery';

interface AnalyticsQueryFiltersProps {
  analyticsQuery?: AnalyticsQuery;
}

export const AnalyticsQueryFilters = (props: AnalyticsQueryFiltersProps) =>
  props.analyticsQuery?.analyticsQueryFilters?.map((analytcsQueryFilter) => (
    <AnalyticsQueryFilter analyticsQueryFilter={analytcsQueryFilter} />
  ));
