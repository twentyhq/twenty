import { isDefined } from 'twenty-shared/utils';
import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsAdminWorkerMetricsTooltip } from '@/settings/admin-panel/health-status/components/SettingsAdminWorkerMetricsTooltip';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { ResponsiveLine } from '@nivo/line';
import { useContext, useEffect } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import {
  QueueMetricsTimeRange,
  GetQueueMetricsDocument,
} from '~/generated-metadata/graphql';

const StyledGraphContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  height: 240px;
  margin-bottom: ${themeCssVariables.spacing[4]};
  padding-top: 10px;
  width: 100%;
`;

const StyledNoDataMessage = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  height: 100%;
  justify-content: center;
`;

const StyledSettingsAdminTableCardContainer = styled.div`
  > * {
    padding-left: ${themeCssVariables.spacing[2]};
    padding-right: ${themeCssVariables.spacing[2]};
  }
`;

type SettingsAdminWorkerMetricsGraphProps = {
  queueName: string;
  timeRange: QueueMetricsTimeRange;
  onTimeRangeChange: (range: QueueMetricsTimeRange) => void;
};

export const SettingsAdminWorkerMetricsGraph = ({
  queueName,
  timeRange,
}: SettingsAdminWorkerMetricsGraphProps) => {
  const { theme } = useContext(ThemeContext);
  const { enqueueErrorSnackBar } = useSnackBar();

  const { loading, data, error } = useQuery(GetQueueMetricsDocument, {
    variables: {
      queueName,
      timeRange,
    },
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    if (error) {
      const errorMessage = error.message;
      enqueueErrorSnackBar({
        message: t`Error fetching worker metrics: ${errorMessage}`,
      });
    }
  }, [error, enqueueErrorSnackBar]);

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
    <>
      <StyledGraphContainer>
        {loading ? (
          <StyledNoDataMessage>{t`Loading metrics data...`}</StyledNoDataMessage>
        ) : hasData ? (
          <ResponsiveLine
            data={metricsData}
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
              max: getMaxYValue(),
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
            sliceTooltip={({ slice }) => (
              <SettingsAdminWorkerMetricsTooltip slice={slice} />
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
                itemTextColor: theme.font.color.secondary,
                symbolSize: 4,
                symbolShape: 'circle',
              },
            ]}
          />
        ) : (
          <StyledNoDataMessage>{t`No metrics data available`}</StyledNoDataMessage>
        )}
      </StyledGraphContainer>
      {isDefined(metricsDetails) && (
        <StyledSettingsAdminTableCardContainer>
          <SettingsAdminTableCard
            rounded
            items={Object.entries(metricsDetails)
              .filter(([key]) => key !== '__typename')
              .map(([key, value]) => ({
                label: key.charAt(0).toUpperCase() + key.slice(1),
                value:
                  typeof value === 'number'
                    ? value
                    : Array.isArray(value)
                      ? value.length
                      : String(value),
              }))}
            gridAutoColumns="1fr 1fr"
            labelAlign="left"
            valueAlign="right"
          />
        </StyledSettingsAdminTableCardContainer>
      )}
    </>
  );
};
