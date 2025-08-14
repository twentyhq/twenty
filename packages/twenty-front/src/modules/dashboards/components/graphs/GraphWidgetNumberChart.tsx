import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

type GraphWidgetNumberChartProps = {
  label: string;
  value: string;
  trendPercentage: number;
};

const TrendIndicator = ({ trendPercentage }: { trendPercentage: number }) => {
  const trendIcon =
    trendPercentage > 0 ? (
      <IconTrendingUp color="green" />
    ) : (
      <IconTrendingDown color="red" />
    );
  return (
    <div>
      <span>{trendPercentage}%</span>
      {trendIcon}
    </div>
  );
};

export const GraphWidgetNumberChart = ({
  label,
  value,
  trendPercentage,
}: GraphWidgetNumberChartProps) => {
  return (
    <div>
      <h3>{label}</h3>
      <p>{value}</p>
      <TrendIndicator trendPercentage={trendPercentage} />
    </div>
  );
};
