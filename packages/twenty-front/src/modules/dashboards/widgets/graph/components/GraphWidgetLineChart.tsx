import styled from '@emotion/styled';
import {
  ResponsiveLine,
  type LineSeries,
  type Point,
  type SliceTooltipProps,
} from '@nivo/line';
import { type ScaleLinearSpec, type ScaleSpec } from '@nivo/scales';
import { useId, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useTheme } from '@emotion/react';
import { type GraphColor } from '../types/GraphColor';
import { createGradientDef } from '../utils/createGradientDef';
import { createGraphColorRegistry } from '../utils/createGraphColorRegistry';
import { getColorScheme } from '../utils/getColorScheme';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '../utils/graphFormatters';
import { GraphWidgetLegend } from './GraphWidgetLegend';
import { GraphWidgetTooltip } from './GraphWidgetTooltip';

type LineChartDataPoint = {
  x: number | string | Date;
  y: number | null;
  to?: string;
};

type LineChartSeries = {
  id: string;
  label?: string;
  color?: GraphColor;
  data: LineChartDataPoint[];
  enableArea?: boolean;
};

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

  const dataMap = useMemo(() => {
    const map: Record<string, LineChartSeries> = {};
    for (const series of data) {
      map[series.id] = series;
    }
    return map;
  }, [data]);

  const enrichedSeries = useMemo(() => {
    return data.map((series, index) => {
      const colorScheme = getColorScheme(colorRegistry, series.color, index);
      const shouldEnableArea = series.enableArea ?? enableArea;
      const gradientId = `lineGradient-${id}-${instanceId}-${series.id}-${index}`;

      return {
        ...series,
        colorScheme,
        gradientId,
        shouldEnableArea,
        label: series.label || series.id,
      };
    });
  }, [data, colorRegistry, id, instanceId, enableArea]);

  const nivoData = data.map((series) => ({
    id: series.id,
    data: series.data.map((point) => ({
      x: point.x,
      y: point.y,
    })),
  }));

  const defs = enrichedSeries
    .filter((series) => series.shouldEnableArea)
    .map((series) =>
      createGradientDef(
        series.colorScheme,
        series.gradientId,
        false,
        90,
        theme.name === 'light',
      ),
    );

  const fill = enrichedSeries
    .filter((series) => series.shouldEnableArea)
    .map((series) => ({
      match: { id: series.id },
      id: series.gradientId,
    }));

  const colors = enrichedSeries.map((series) => series.colorScheme.solid);

  const handlePointClick = (point: Point<LineSeries>) => {
    const series = dataMap[point.seriesId];
    if (isDefined(series)) {
      const dataPoint = series.data[point.indexInSeries];
      if (isDefined(dataPoint?.to) === true) {
        window.location.href = dataPoint.to;
      }
    }
  };

  const hasClickableItems = data.some((series) =>
    series.data.some((point) => isDefined(point.to)),
  );

  const renderSliceTooltip = ({ slice }: SliceTooltipProps<LineSeries>) => {
    const tooltipItems = slice.points
      .map((point) => {
        const enrichedSeriesItem = enrichedSeries.find(
          (s) => s.id === point.seriesId,
        );
        if (!enrichedSeriesItem) return null;

        return {
          label: enrichedSeriesItem.label,
          formattedValue: formatGraphValue(
            Number(point.data.y || 0),
            formatOptions,
          ),
          dotColor: enrichedSeriesItem.colorScheme.solid,
        };
      })
      .filter(isDefined);

    const hasClickablePoint = slice.points.some((point) => {
      const series = dataMap[point.seriesId];
      if (isDefined(series)) {
        const dataPoint = series.data[point.indexInSeries];
        return isDefined(dataPoint?.to);
      }
      return false;
    });

    return (
      <GraphWidgetTooltip
        items={tooltipItems}
        showClickHint={hasClickablePoint}
      />
    );
  };

  const renderPointTooltip = (point: Point<LineSeries>) => {
    const enrichedSeriesItem = enrichedSeries.find(
      (s) => s.id === point.seriesId,
    );
    if (!enrichedSeriesItem) return null;

    const series = dataMap[point.seriesId];
    const dataPoint = series?.data[point.indexInSeries];

    return (
      <GraphWidgetTooltip
        items={[
          {
            label: enrichedSeriesItem.label,
            formattedValue: formatGraphValue(
              Number(point.data.y || 0),
              formatOptions,
            ),
            dotColor: enrichedSeriesItem.colorScheme.solid,
          },
        ]}
        showClickHint={isDefined(dataPoint?.to)}
      />
    );
  };

  const getAxisBottomConfig = () => ({
    tickSize: 0,
    tickPadding: 5,
    tickRotation: 0,
    legend: xAxisLabel,
    legendPosition: 'middle' as const,
    legendOffset: 40,
  });

  const getAxisLeftConfig = () => ({
    tickSize: 0,
    tickPadding: 5,
    tickRotation: 0,
    legend: yAxisLabel,
    legendPosition: 'middle' as const,
    legendOffset: -50,
    format: (value: number) => formatGraphValue(value, formatOptions),
  });

  const legendItems = enrichedSeries.map((series) => {
    const total = series.data.reduce((sum, point) => sum + (point.y || 0), 0);
    return {
      id: series.id,
      label: series.label,
      formattedValue: formatGraphValue(total, formatOptions),
      color: series.colorScheme.solid,
    };
  });

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
          axisBottom={getAxisBottomConfig()}
          axisLeft={getAxisLeftConfig()}
          enableGridX={showGrid}
          enableGridY={showGrid}
          enableSlices={enableSlices}
          sliceTooltip={enableSlices === 'x' ? renderSliceTooltip : undefined}
          tooltip={
            enableSlices === false
              ? ({ point }) => renderPointTooltip(point)
              : undefined
          }
          onClick={(datum) => {
            if ('seriesId' in datum) {
              handlePointClick(datum as Point<LineSeries>);
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
