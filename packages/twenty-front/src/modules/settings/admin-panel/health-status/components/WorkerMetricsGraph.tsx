import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveLine } from '@nivo/line';
import { useState } from 'react';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { useGetQueueMetricsQuery } from '~/generated/graphql';

const StyledGraphContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 230px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledGraphControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const StyledNoDataMessage = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  height: 100%;
  justify-content: center;
`;

const StyledTooltipContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledTooltipTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledTooltipItem = styled.div<{ color: string }>`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  padding: ${({ theme }) => theme.spacing(0.5)} 0;
`;

const StyledTooltipColorSquare = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background-color: ${({ color }) => color};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTooltipValue = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

type WorkerMetricsGraphProps = {
  queueName: string;
};

export const WorkerMetricsGraph = ({ queueName }: WorkerMetricsGraphProps) => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();

  const [timeRange, setTimeRange] = useState<'7D' | '1D' | '12H' | '4H'>('1D');

  const { loading, data } = useGetQueueMetricsQuery({
    variables: {
      queueName,
      timeRange,
    },
    fetchPolicy: 'network-only',
    onError: (error) => {
      enqueueSnackBar(`Error fetching worker metrics: ${error.message}`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const metricsData = data?.getQueueMetrics?.[0]?.data || [];
  const hasData =
    metricsData.length > 0 &&
    metricsData.some((series) => series.data.length > 0);

  const details = JSON.parse(data?.getQueueMetrics?.[0]?.details || '{}');

  const getAxisBottomFormat = () => {
    switch (timeRange) {
      case '7D':
        return '%b %d';
      case '1D':
      case '12H':
      case '4H':
      default:
        return '%H:%M';
    }
  };

  return (
    <>
      <StyledGraphControls>
        <Select
          dropdownId={`timerange-${queueName}`}
          value={timeRange}
          options={[
            { value: '7D', label: 'This week' },
            { value: '1D', label: 'Today' },
            { value: '12H', label: 'Last 12 hours' },
            { value: '4H', label: 'Last 4 hours' },
          ]}
          onChange={(value) => {
            setTimeRange(value);
          }}
          needIconCheck
        />
      </StyledGraphControls>

      <StyledGraphContainer>
        {loading ? (
          <StyledNoDataMessage>Loading metrics data...</StyledNoDataMessage>
        ) : hasData ? (
          <ResponsiveLine
            data={metricsData}
            curve="monotoneX"
            enableArea={true}
            colors={[theme.color.green, theme.color.red]}
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
            margin={{ top: 40, right: 30, bottom: 40, left: 50 }}
            xFormat="time:%Y-%m-%d %H:%M"
            xScale={{
              type: 'time',
              useUTC: false,
              format: '%Y-%m-%d %H:%M:%S',
              precision: 'minute',
            }}
            yScale={{
              type: 'linear',
              min: 0,
              stacked: false,
            }}
            axisBottom={{
              format: getAxisBottomFormat(),
              tickValues: 5,
              tickPadding: 5,
              tickSize: 6,
              legend: 'Time',
              legendOffset: 30,
              legendPosition: 'middle',
            }}
            axisLeft={{
              tickSize: 6,
              tickPadding: 5,
              tickValues: 4,
              legend: 'Count',
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            enableGridX={false}
            gridYValues={4}
            pointSize={0}
            enableSlices="x"
            sliceTooltip={({ slice }) => {
              return (
                <StyledTooltipContainer>
                  <StyledTooltipTitle>
                    {new Date(slice.points[0].data.x).toLocaleTimeString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </StyledTooltipTitle>
                  {slice.points.map((point) => (
                    <StyledTooltipItem key={point.id} color={point.serieColor}>
                      <StyledTooltipColorSquare color={point.serieColor} />
                      <span>
                        {point.serieId}:{' '}
                        <StyledTooltipValue>
                          {String(point.data.y)}
                        </StyledTooltipValue>
                      </span>
                    </StyledTooltipItem>
                  ))}
                </StyledTooltipContainer>
              );
            }}
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
                symbolSize: 12,
                symbolShape: 'square',
              },
            ]}
          />
        ) : (
          <StyledNoDataMessage>No metrics data available</StyledNoDataMessage>
        )}
      </StyledGraphContainer>
      <pre>{JSON.stringify(details, null, 2)}</pre>
    </>
  );
};
