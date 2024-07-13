import { Chart } from '@/activities/charts/types/Chart';
import { Select } from '@/ui/input/components/Select';

interface ChartConfigProps {
  chart?: Chart;
}

export const ChartConfig = (props: ChartConfigProps) => {
  const chartTypes: any[] = [];

  return (
    <Select
      label="Chart type"
      fullWidth
      dropdownId="chart-type-select"
      options={chartTypes}
    />
  );
};
