import { ChartFilter } from '@/activities/charts/components/AnalyticsQueryFilter';
import { Chart } from '@/activities/charts/types/Chart';

interface AnalyticsQueryFiltersProps {
  chart?: Chart;
}

export const AnalyticsQueryFilters = (props: AnalyticsQueryFiltersProps) =>
  props.chart?.chartFilters?.map((chartFilter) => (
    <ChartFilter chartFilter={chartFilter} />
  ));
