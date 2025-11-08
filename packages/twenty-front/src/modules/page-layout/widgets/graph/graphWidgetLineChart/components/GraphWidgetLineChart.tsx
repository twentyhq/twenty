import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import {
  CustomCrosshairLayer,
  type SliceHoverData,
} from '@/page-layout/widgets/graph/graphWidgetLineChart/components/CustomCrosshairLayer';
import { LINE_CHART_MARGIN_BOTTOM } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginBottom';
import { LINE_CHART_MARGIN_LEFT } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginLeft';
import { LINE_CHART_MARGIN_RIGHT } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginRight';
import { LINE_CHART_MARGIN_TOP } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginTop';
import { LINE_CHART_TOOLTIP_SCROLLABLE_POINT_THRESHOLD } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartTooltipScrollablePointThreshold';
import { useLineChartTooltipContextOrThrow } from '@/page-layout/widgets/graph/graphWidgetLineChart/contexts/LineChartTooltipContext';
import { useLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartData';
import { useLineChartTheme } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartTheme';
import { useLineChartTooltip } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartTooltip';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { getLineChartAxisBottomConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisBottomConfig';
import { getLineChartAxisLeftConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisLeftConfig';
import { handleLineChartPointClick } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/handleLineChartPointClick';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { createVirtualElementFromChartCoordinates } from '@/page-layout/widgets/graph/utils/createVirtualElementFromChartCoordinates';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ResponsiveLine } from '@nivo/line';
import { type ScaleLinearSpec, type ScaleSpec } from '@nivo/scales';
import { useCallback, useId } from 'react';
import { isDefined } from 'twenty-shared/utils';

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
  enableSlices?: 'x' | 'y';
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
  const chartTheme = useLineChartTheme();

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
  });

  const { createSliceTooltipData } = useLineChartTooltip({
    dataMap,
    enrichedSeries,
    formatOptions,
  });

  const { showTooltip } = useLineChartTooltipContextOrThrow();

  const handleSliceHover = useCallback(
    (data: SliceHoverData) => {
      const tooltipData = createSliceTooltipData({
        slice: {
          id: String(data.nearestSlice.xValue ?? ''),
          x: data.nearestSlice.x,
          y: data.mouseY,
          x0: data.nearestSlice.x,
          y0: 0,
          width: 0,
          height: 0,
          points: data.nearestSlice.points,
        },
        axis: 'x',
      });

      if (!isDefined(tooltipData)) {
        return;
      }

      const virtualAnchor = createVirtualElementFromChartCoordinates({
        left: data.svgRect.left + data.nearestSlice.x + LINE_CHART_MARGIN_LEFT,
        top: data.svgRect.top + data.mouseY + LINE_CHART_MARGIN_TOP,
      });

      showTooltip(
        virtualAnchor,
        tooltipData.items,
        tooltipData.indexLabel,
        String(data.closestPoint.seriesId),
        data.nearestSlice.points.length >
          LINE_CHART_TOOLTIP_SCROLLABLE_POINT_THRESHOLD,
        data.sliceX,
      );
    },
    [createSliceTooltipData, showTooltip],
  );

  const axisBottomConfig = getLineChartAxisBottomConfig(xAxisLabel);
  const axisLeftConfig = getLineChartAxisLeftConfig(yAxisLabel, formatOptions);

  const onPointClick = (
    point: Parameters<typeof handleLineChartPointClick>[0],
  ) => {
    handleLineChartPointClick(point, dataMap);
  };

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer $isClickable={hasClickableItems}>
        <ResponsiveLine
          data={nivoData}
          margin={{
            top: LINE_CHART_MARGIN_TOP,
            right: LINE_CHART_MARGIN_RIGHT,
            bottom: LINE_CHART_MARGIN_BOTTOM,
            left: LINE_CHART_MARGIN_LEFT,
          }}
          xScale={xScale}
          yScale={getYScaleWithStacking(yScale, stackedArea)}
          curve={curve}
          lineWidth={lineWidth}
          enableArea={enableArea}
          areaBaselineValue={0}
          enablePoints={enablePoints}
          pointSize={6}
          pointBorderWidth={0}
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
          sliceTooltip={() => null}
          tooltip={() => null}
          layers={[
            'grid',
            'markers',
            'axes',
            'areas',
            'lines',
            (layerProps) => (
              <CustomCrosshairLayer
                key="custom-crosshair-layer"
                points={layerProps.points}
                innerHeight={layerProps.innerHeight}
                innerWidth={layerProps.innerWidth}
                onSliceHover={handleSliceHover}
              />
            ),
            'points',
            'legends',
          ]}
          onClick={(datum) => {
            if ('seriesId' in datum) {
              onPointClick(
                datum as Parameters<typeof handleLineChartPointClick>[0],
              );
            }
          }}
          useMesh={true}
          crosshairType="cross"
          theme={chartTheme}
        />
      </GraphWidgetChartContainer>
      <GraphWidgetLegend show={showLegend} items={legendItems} />
    </StyledContainer>
  );
};
