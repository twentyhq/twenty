import { Chart as ChartType } from '@/activities/charts/types/Chart';

interface ChartProps {
  chart: ChartType;
}

export const Chart = (props: ChartProps) => (
  <div>
    <h2>{props.chart.title}</h2>
    <p>{props.chart.title}</p>
    {/* TODO: Nivo charts */}
  </div>
);
