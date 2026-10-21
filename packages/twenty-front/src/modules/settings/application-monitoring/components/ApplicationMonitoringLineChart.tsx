import { styled } from '@linaria/react';
import { ResponsiveLine } from '@nivo/line';
import { type ThemeColor, themeCssVariables, useTheme } from 'twenty-ui/theme';

import { SettingsAdminWorkerMetricsTooltip } from '@/settings/admin-panel/health-status/components/SettingsAdminWorkerMetricsTooltip';
import { type ApplicationMonitoringChartDatum } from '@/settings/application-monitoring/types/ApplicationMonitoringChartDatum';

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
  height: 4px;
  width: 4px;
`;

const StyledChart = styled.div`
  flex: 1;
  min-height: 0;
`;

type ApplicationMonitoringLineChartProps<TSeriesKey extends string> = {
  data: ApplicationMonitoringChartDatum<TSeriesKey>[];
  series: { key: TSeriesKey; label: string; color: ThemeColor }[];
  axisLabel: string;
};

export const ApplicationMonitoringLineChart = <TSeriesKey extends string>({
  data,
  series,
  axisLabel,
}: ApplicationMonitoringLineChartProps<TSeriesKey>) => {
  const theme = useTheme();

  const lineData = series.map(({ key, label }) => ({
    id: label,
    data: data.map((datum, index) => ({ x: index, y: datum[key] })),
  }));

  const maxValue = Math.max(
    0,
    ...data.flatMap((datum) => series.map(({ key }) => datum[key])),
  );

  return (
    <StyledGraphContainer>
      <StyledLegend>
        {series.map(({ key, label, color }) => (
          <StyledLegendItem key={key}>
            <StyledLegendDot color={theme.color[color]} />
            {label}
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
            max: maxValue === 0 ? 2 : maxValue * 1.1,
            stacked: false,
          }}
          yFormat=">-,.2~f"
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
        />
      </StyledChart>
    </StyledGraphContainer>
  );
};
