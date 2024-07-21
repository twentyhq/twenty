import { ChartFilter } from '@/activities/charts/components/ChartFilter';
import { Chart } from '@/activities/charts/types/Chart';

interface ChartFiltersProps {
  chart?: Chart;
}

export const ChartFilters = (props: ChartFiltersProps) =>
  props.chart?.chartFilters?.map((chartFilter) => (
    <ChartFilter chartFilter={chartFilter} />
  ));
