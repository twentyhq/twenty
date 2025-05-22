import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { ResponsiveLine } from '@nivo/line';
import { QueueMetricsTimeRange } from '~/generated/graphql';
import { WorkerMetricsTooltip } from './WorkerMetricsTooltip';

type NivoLineChartProps = {
  data: Array<{
    id: string;
    data: Array<{
      x: number;
      y: number | null;
    }>;
  }>;
  timeRange: QueueMetricsTimeRange;
  maxYValue: number;
};

export const NivoLineChart = ({
  data,
  timeRange,
  maxYValue,
}: NivoLineChartProps) => {
  const theme = useTheme();

  const getAxisLabel = () => {
    switch (timeRange) {
      case QueueMetricsTimeRange.OneHour:
        return t`Last 1 Hour (oldest → newest)`;
      case QueueMetricsTimeRange.FourHours:
        return t`Last 4 Hours (oldest → newest)`;
      case QueueMetricsTimeRange.TwelveHours:
        return t`Last 12 Hours (oldest → newest)`;
      case QueueMetricsTimeRange.OneDay:
        return t`Last 24 Hours (oldest → newest)`;
      case QueueMetricsTimeRange.SevenDays:
        return t`Last 7 Days (oldest → newest)`;
      default:
        return t`Recent Events (oldest → newest)`;
    }
  };

  return (
    <ResponsiveLine
      data={data}
      curve="monotoneX"
      enableArea={true}
      colors={[theme.color.blue, theme.color.red]}
      theme={{
        text: {
          fill: theme.font.color.light,
          fontSize: theme.font.size.sm,
          fontFamily: theme.font.family,
        },
        axis: {
          domain: {
            line: {
              stroke: theme.border.color.strong,
            },
          },
          ticks: {
            line: {
              stroke: theme.border.color.strong,
            },
          },
        },
        grid: {
          line: {
            stroke: theme.border.color.medium,
          },
        },
        crosshair: {
          line: {
            stroke: theme.font.color.primary,
            strokeDasharray: '2 2',
          },
        },
      }}
      margin={{ top: 40, right: 30, bottom: 40, left: 40 }}
      xScale={{
        type: 'linear',
        min: 0,
        max: 'auto',
      }}
      yScale={{
        type: 'linear',
        min: 0,
        max: maxYValue,
        stacked: false,
      }}
      axisBottom={{
        legend: getAxisLabel(),
        legendOffset: 20,
        legendPosition: 'middle',
        tickSize: 5,
        tickPadding: 5,
        tickValues: 5,
        format: () => '',
      }}
      axisLeft={{
        tickSize: 6,
        tickPadding: 5,
        tickValues: 4,
      }}
      enableGridX={false}
      gridYValues={4}
      pointSize={0}
      enableSlices="x"
      sliceTooltip={({ slice }) => <WorkerMetricsTooltip slice={slice} />}
      useMesh={true}
      legends={[
        {
          anchor: 'top-right',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: -40,
          itemsSpacing: 10,
          itemDirection: 'left-to-right',
          itemWidth: 100,
          itemHeight: 20,
          itemTextColor: theme.font.color.secondary,
          symbolSize: 4,
          symbolShape: 'circle',
        },
      ]}
    />
  );
};
