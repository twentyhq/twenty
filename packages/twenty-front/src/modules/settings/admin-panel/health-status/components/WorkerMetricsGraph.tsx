import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveLine } from '@nivo/line';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  QueueMetricsTimeRange,
  useGetQueueMetricsQuery,
} from '~/generated/graphql';

const StyledTableRow = styled(TableRow)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledQueueMetricsTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledGraphContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 230px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(4)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledQueueMetricsContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
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
  timeRange: QueueMetricsTimeRange;
  onTimeRangeChange: (range: QueueMetricsTimeRange) => void;
};

export const WorkerMetricsGraph = ({
  queueName,
  timeRange,
  onTimeRangeChange,
}: WorkerMetricsGraphProps) => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();

  const { loading, data } = useGetQueueMetricsQuery({
    variables: {
      queueName,
      timeRange,
    },
    fetchPolicy: 'no-cache',
    onError: (error) => {
      enqueueSnackBar(`Error fetching worker metrics: ${error.message}`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const metricsData = data?.getQueueMetrics?.data || [];
  const hasData =
    metricsData.length > 0 &&
    metricsData.some((series) => series.data.length > 0);

  const metricsDetails = {
    workers: data?.getQueueMetrics?.workers,
    ...data?.getQueueMetrics?.details,
  };

  const getMaxYValue = () => {
    if (!hasData) return 2;

    let maxValue = 0;
    metricsData.forEach((series) => {
      series.data.forEach((point) => {
        if (typeof point.y === 'number' && point.y > maxValue) {
          maxValue = point.y;
        }
      });
    });

    return maxValue === 0 ? 2 : maxValue * 1.1;
  };

  const getAxisLabel = () => {
    switch (timeRange) {
      case QueueMetricsTimeRange.OneHour:
        return 'Last 1 Hour (oldest → newest)';
      case QueueMetricsTimeRange.FourHours:
        return 'Last 4 Hours (oldest → newest)';
      case QueueMetricsTimeRange.TwelveHours:
        return 'Last 12 Hours (oldest → newest)';
      case QueueMetricsTimeRange.OneDay:
        return 'Last 24 Hours (oldest → newest)';
      case QueueMetricsTimeRange.SevenDays:
        return 'Last 7 Days (oldest → newest)';
      default:
        return 'Recent Events (oldest → newest)';
    }
  };

  return (
    <>
      <StyledGraphControls>
        <Select
          dropdownId={`timerange-${queueName}`}
          value={timeRange}
          options={[
            { value: QueueMetricsTimeRange.SevenDays, label: 'This week' },
            { value: QueueMetricsTimeRange.OneDay, label: 'Today' },
            {
              value: QueueMetricsTimeRange.TwelveHours,
              label: 'Last 12 hours',
            },
            { value: QueueMetricsTimeRange.FourHours, label: 'Last 4 hours' },
            { value: QueueMetricsTimeRange.OneHour, label: 'Last 1 hour' },
          ]}
          onChange={onTimeRangeChange}
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
            xScale={{
              type: 'linear',
              min: 0,
              max: 'auto',
            }}
            yScale={{
              type: 'linear',
              min: 0,
              max: getMaxYValue(),
              stacked: false,
            }}
            axisBottom={{
              legend: getAxisLabel(),
              legendOffset: 30,
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
              legend: 'Count',
              legendOffset: -40,
              legendPosition: 'middle',
            }}
            enableGridX={false}
            gridYValues={4}
            pointSize={0}
            enableSlices="x"
            sliceTooltip={({ slice }) => (
              <StyledTooltipContainer>
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
            )}
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
      {metricsDetails && (
        <>
          <StyledQueueMetricsTitle>Metrics:</StyledQueueMetricsTitle>
          <StyledQueueMetricsContainer>
            <Table>
              {Object.entries(metricsDetails)
                .filter(([key]) => key !== '__typename')
                .map(([key, value]) => (
                  <StyledTableRow key={key}>
                    <TableCell align="left">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </TableCell>
                    <TableCell align="right">
                      {typeof value === 'number'
                        ? value
                        : Array.isArray(value)
                          ? value.length
                          : String(value)}
                    </TableCell>
                  </StyledTableRow>
                ))}
            </Table>
          </StyledQueueMetricsContainer>
        </>
      )}
    </>
  );
};
