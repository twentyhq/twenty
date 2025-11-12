import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import {
  CustomCrosshairLayer,
  type SliceHoverData,
} from '@/page-layout/widgets/graph/graphWidgetLineChart/components/CustomCrosshairLayer';
import { GraphLineChartTooltip } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphLineChartTooltip';
import { LINE_CHART_MARGIN_BOTTOM } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginBottom';
import { LINE_CHART_MARGIN_LEFT } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginLeft';
import { LINE_CHART_MARGIN_RIGHT } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginRight';
import { LINE_CHART_MARGIN_TOP } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginTop';
import { useLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartData';
import { useLineChartTheme } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartTheme';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { getLineChartAxisBottomConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisBottomConfig';
import { getLineChartAxisLeftConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisLeftConfig';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ResponsiveLine,
  type LineSeries,
  type SliceTooltipProps,
} from '@nivo/line';
import { type ScaleLinearSpec, type ScaleSpec } from '@nivo/scales';
import { useCallback, useId, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

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

  const [activeLineTooltip, setActiveLineTooltip] = useState<{
    slice: SliceTooltipProps<LineSeries>['slice'];
    offsetLeft: number;
    offsetTop: number;
    highlightedSeriesId: string;
    linkTo: string | undefined;
  } | null>(null);
  const [crosshairX, setCrosshairX] = useState<number | null>(null);

  const hideTooltip = useCallback(() => {
    setActiveLineTooltip(null);
    setCrosshairX(null);
  }, []);

  const debouncedHideTooltip = useDebouncedCallback(hideTooltip, 300);

  const handleTooltipMouseEnter = () => {
    debouncedHideTooltip.cancel();
  };

  const handleTooltipMouseLeave = debouncedHideTooltip;

  const handleSliceHover = useCallback(
    (sliceData: SliceHoverData) => {
      const slice: SliceTooltipProps<LineSeries>['slice'] = {
        id: String(sliceData.nearestSlice.xValue ?? ''),
        x: sliceData.nearestSlice.x,
        y: sliceData.mouseY,
        x0: sliceData.nearestSlice.x,
        y0: 0,
        width: 0,
        height: 0,
        points: sliceData.nearestSlice.points,
      };

      const offsetLeft = sliceData.nearestSlice.x + LINE_CHART_MARGIN_LEFT;
      const offsetTop = sliceData.mouseY + LINE_CHART_MARGIN_TOP;

      const seriesForLink = dataMap[String(sliceData.closestPoint.seriesId)];
      const linkTo =
        seriesForLink?.data?.[sliceData.closestPoint.indexInSeries]?.to;

      debouncedHideTooltip.cancel();
      setCrosshairX(sliceData.sliceX);
      setActiveLineTooltip({
        slice,
        offsetLeft,
        offsetTop,
        highlightedSeriesId: String(sliceData.closestPoint.seriesId),
        linkTo,
      });
    },
    [dataMap, debouncedHideTooltip],
  );

  const axisBottomConfig = getLineChartAxisBottomConfig(xAxisLabel);
  const axisLeftConfig = getLineChartAxisLeftConfig(yAxisLabel, formatOptions);

  const shouldShowLineChartTooltip = isDefined(activeLineTooltip);

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        $isClickable={hasClickableItems}
        onMouseLeave={() => debouncedHideTooltip()}
      >
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
          areaBlendMode={'normal'}
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
                crosshairX={crosshairX}
                onRectLeave={() => debouncedHideTooltip()}
              />
            ),
            'points',
            'legends',
          ]}
          useMesh={true}
          crosshairType="cross"
          theme={chartTheme}
        />
      </GraphWidgetChartContainer>
      {shouldShowLineChartTooltip && (
        <GraphLineChartTooltip
          slice={activeLineTooltip.slice}
          offsetLeft={activeLineTooltip.offsetLeft}
          offsetTop={activeLineTooltip.offsetTop}
          containerId={id}
          enrichedSeries={enrichedSeries}
          formatOptions={formatOptions}
          highlightedSeriesId={activeLineTooltip.highlightedSeriesId}
          linkTo={activeLineTooltip.linkTo}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
      <GraphWidgetLegend show={showLegend} items={legendItems} />
    </StyledContainer>
  );
};
