import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ResponsiveLine } from '@nivo/line';
import { isDefined } from 'twenty-shared/utils';
import { type ThemeColor, themeCssVariables, useTheme } from 'twenty-ui/theme';

import { ApplicationMonitoringChartTooltip } from '@/settings/application-monitoring/components/ApplicationMonitoringChartTooltip';
import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';
import { getApplicationMonitoringChartIntegerTickValues } from '@/settings/application-monitoring/utils/getApplicationMonitoringChartIntegerTickValues';
import { getApplicationMonitoringChartValueFormat } from '@/settings/application-monitoring/utils/getApplicationMonitoringChartValueFormat';

const StyledGraphContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 240px;
  padding-top: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[4]};
  justify-content: flex-end;
  padding: 0 ${themeCssVariables.spacing[8]};
`;

const StyledLegendItem = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLegendDot = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  height: ${themeCssVariables.spacing[1]};
  width: ${themeCssVariables.spacing[1]};
`;

const StyledChart = styled.div`
  flex: 1;
  min-height: 0;
`;

type ApplicationMonitoringLineChartProps<TSeriesKey extends string> = {
  data: ApplicationMonitoringChartDatum<TSeriesKey>[];
  series: { key: TSeriesKey; label: string; color: ThemeColor }[];
  axisLabel: string;
  getTotalFormatOptions?: (total: number) => Intl.NumberFormatOptions;
};

export const ApplicationMonitoringLineChart = <TSeriesKey extends string>({
  data,
  series,
  axisLabel,
  getTotalFormatOptions,
}: ApplicationMonitoringLineChartProps<TSeriesKey>) => {
  const theme = useTheme();
  const { i18n } = useLingui();

  const lineData: { id: string; data: { x: number; y: number }[] }[] =
    series.map(({ key, label }) => ({
      id: label,
      data: data.map((datum, index) => ({ x: index, y: datum[key] })),
    }));

  const values = data.flatMap((datum) => series.map(({ key }) => datum[key]));
  const maxValue = Math.max(0, ...values);
  const integerTickValues = values.every(Number.isInteger)
    ? getApplicationMonitoringChartIntegerTickValues(maxValue)
    : undefined;

  const formatSeriesTotal = (key: TSeriesKey) => {
    const total = data.reduce((sum, datum) => sum + datum[key], 0);

    return i18n.number(total, getTotalFormatOptions?.(total));
  };

  const formatBucketStart = (bucketIndex: number | string | Date) => {
    const bucketStart =
      typeof bucketIndex === 'number'
        ? data[bucketIndex]?.bucketStart
        : undefined;

    return isDefined(bucketStart)
      ? i18n.date(new Date(bucketStart), {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '';
  };

  return (
    <StyledGraphContainer>
      <StyledLegend>
        {series.map(({ key, label, color }) => (
          <StyledLegendItem key={key}>
            <StyledLegendDot color={theme.color[color]} />
            {`${label} (${formatSeriesTotal(key)})`}
          </StyledLegendItem>
        ))}
      </StyledLegend>
      <StyledChart>
        <ResponsiveLine
          data={lineData}
          curve="monotoneX"
          enableArea={true}
          colors={series.map(({ color }) => theme.color[color])}
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
          margin={{ top: 10, right: 30, bottom: 40, left: 40 }}
          xScale={{
            type: 'linear',
            min: 0,
            max: 'auto',
          }}
          yScale={{
            type: 'linear',
            min: 0,
            max: isDefined(integerTickValues)
              ? integerTickValues[integerTickValues.length - 1]
              : maxValue === 0
                ? 2
                : maxValue * 1.1,
            stacked: false,
          }}
          yFormat={getApplicationMonitoringChartValueFormat({
            hasIntegerValues: isDefined(integerTickValues),
            maxValue,
          })}
          axisBottom={{
            legend: axisLabel,
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
            tickValues: integerTickValues ?? 4,
          }}
          enableGridX={false}
          gridYValues={integerTickValues ?? 4}
          pointSize={0}
          enableSlices="x"
          sliceTooltip={({ slice }) => (
            <ApplicationMonitoringChartTooltip
              title={formatBucketStart(slice.points[0]?.data.x ?? '')}
              points={slice.points}
            />
          )}
          useMesh={true}
        />
      </StyledChart>
    </StyledGraphContainer>
  );
};
