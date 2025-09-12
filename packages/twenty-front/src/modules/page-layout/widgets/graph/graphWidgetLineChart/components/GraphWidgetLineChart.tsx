import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { useLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartData';
import { useLineChartTooltip } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartTooltip';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { getLineChartAxisBottomConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisBottomConfig';
import { getLineChartAxisLeftConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisLeftConfig';
import { handleLineChartPointClick } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/handleLineChartPointClick';
import { GraphWidgetTooltip } from '@/page-layout/widgets/graph/components/GraphWidgetTooltip';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveLine } from '@nivo/line';
import { type ScaleLinearSpec, type ScaleSpec } from '@nivo/scales';
import { useId } from 'react';

type GraphWidgetLineChartProps = {
  data: LineChartSeries[];
  showLegend?: boolean;
  showGrid?: boolean;
  enablePoints?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  id: string;
  enableArea?: boolean;
  stackedArea?: boolean;
  curve?:
    | 'linear'
    | 'monotoneX'
    | 'step'
    | 'stepBefore'
    | 'stepAfter'
    | 'natural';
  lineWidth?: number;
  enableSlices?: 'x' | 'y' | false;
  xScale?: ScaleSpec;
  yScale?: ScaleSpec;
} & GraphValueFormatOptions;

const getYScaleWithStacking = (
  yScale: ScaleSpec | undefined,
  stackedArea: boolean | undefined,
): ScaleSpec => {
  if (!yScale || yScale.type === 'linear') {
    const linearScale: ScaleLinearSpec = {
      min: 0,
      max: 'auto',
      ...yScale,
      type: 'linear',
      stacked: stackedArea,
    };
    return linearScale;
  }

  return yScale;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledChartContainer = styled.div<{ $isClickable?: boolean }>`
  flex: 1;
  position: relative;
  width: 100%;

  ${({ $isClickable }) =>
    $isClickable &&
    `
    svg g circle {
      cursor: pointer;
    }
  `}
`;

export const GraphWidgetLineChart = ({
  data,
  showLegend = true,
  showGrid = true,
  enablePoints = false,
  xAxisLabel,
  yAxisLabel,
  id,
  enableArea = false,
  stackedArea = false,
  curve = 'monotoneX',
  lineWidth = 2,
  enableSlices = 'x',
  xScale = { type: 'linear' },
  yScale = { type: 'linear', min: 0, max: 'auto' },
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
}: GraphWidgetLineChartProps) => {
  const theme = useTheme();
  const instanceId = useId();
  const colorRegistry = createGraphColorRegistry(theme);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const {
    dataMap,
    enrichedSeries,
    nivoData,
    defs,
    fill,
    colors,
    legendItems,
    hasClickableItems,
  } = useLineChartData({
    data,
    colorRegistry,
    id,
    instanceId,
    enableArea,
    theme,
    formatOptions,
  });

  const { renderSliceTooltip, renderPointTooltip } = useLineChartTooltip({
    dataMap,
    enrichedSeries,
    formatOptions,
  });

  const axisBottomConfig = getLineChartAxisBottomConfig(xAxisLabel);
  const axisLeftConfig = getLineChartAxisLeftConfig(yAxisLabel, formatOptions);

  const onPointClick = (
    point: Parameters<typeof handleLineChartPointClick>[0],
  ) => {
    handleLineChartPointClick(point, dataMap);
  };

  const sliceTooltip = (props: Parameters<typeof renderSliceTooltip>[0]) => {
    const tooltipData = renderSliceTooltip(props);
    return (
      <GraphWidgetTooltip
        items={tooltipData.items}
        showClickHint={tooltipData.showClickHint}
      />
    );
  };

  const pointTooltip = (point: Parameters<typeof renderPointTooltip>[0]) => {
    const tooltipData = renderPointTooltip(point);
    if (!tooltipData) return null;
    return (
      <GraphWidgetTooltip
        items={tooltipData.items}
        showClickHint={tooltipData.showClickHint}
      />
    );
  };

  return (
    <StyledContainer id={id}>
      <StyledChartContainer $isClickable={hasClickableItems}>
        <ResponsiveLine
          data={nivoData}
          margin={{ top: 20, right: 20, bottom: 60, left: 70 }}
          xScale={xScale}
          yScale={getYScaleWithStacking(yScale, stackedArea)}
          curve={curve}
          lineWidth={lineWidth}
          enableArea={enableArea}
          areaBaselineValue={0}
          enablePoints={enablePoints}
          pointSize={6}
          pointBorderWidth={0}
          areaOpacity={theme.name === 'dark' ? 0.8 : 1}
          colors={colors}
          areaBlendMode={theme.name === 'dark' ? 'screen' : 'multiply'}
          defs={defs}
          fill={fill}
          axisTop={null}
          axisRight={null}
          axisBottom={axisBottomConfig}
          axisLeft={axisLeftConfig}
          enableGridX={showGrid}
          enableGridY={showGrid}
          enableSlices={enableSlices}
          sliceTooltip={enableSlices === 'x' ? sliceTooltip : undefined}
          tooltip={
            enableSlices === false
              ? ({ point }) => pointTooltip(point)
              : undefined
          }
          onClick={(datum) => {
            if ('seriesId' in datum) {
              onPointClick(
                datum as Parameters<typeof handleLineChartPointClick>[0],
              );
            }
          }}
          useMesh={true}
          crosshairType="cross"
          theme={{
            axis: {
              domain: {
                line: {
                  stroke: theme.border.color.light,
                  strokeWidth: 1,
                },
              },
              ticks: {
                line: {
                  stroke: theme.border.color.light,
                  strokeWidth: 1,
                },
                text: {
                  fill: theme.font.color.secondary,
                  fontSize: 12,
                },
              },
              legend: {
                text: {
                  fill: theme.font.color.secondary,
                  fontSize: 12,
                  fontWeight: theme.font.weight.regular,
                },
              },
            },
            grid: {
              line: {
                stroke: theme.border.color.light,
                strokeWidth: 1,
                strokeDasharray: '4 4',
              },
            },
            crosshair: {
              line: {
                stroke: theme.font.color.tertiary,
                strokeWidth: 1,
                strokeDasharray: '2 2',
              },
            },
          }}
        />
      </StyledChartContainer>
      <GraphWidgetLegend show={showLegend} items={legendItems} />
    </StyledContainer>
  );
};
