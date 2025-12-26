import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { NoDataLayer } from '@/page-layout/widgets/graph/components/NoDataLayer';
import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import {
  CustomCrosshairLayer,
  type SliceHoverData,
} from '@/page-layout/widgets/graph/graphWidgetLineChart/components/CustomCrosshairLayer';
import { CustomLinesLayer } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/CustomLinesLayer';
import { CustomPointLabelsLayer } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/CustomPointLabelsLayer';
import { CustomStackedAreasLayer } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/CustomStackedAreasLayer';
import { GraphLineChartTooltip } from '@/page-layout/widgets/graph/graphWidgetLineChart/components/GraphLineChartTooltip';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { useLineChartData } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartData';
import { useLineChartTheme } from '@/page-layout/widgets/graph/graphWidgetLineChart/hooks/useLineChartTheme';
import { graphWidgetLineCrosshairXComponentState } from '@/page-layout/widgets/graph/graphWidgetLineChart/states/graphWidgetLineCrosshairXComponentState';
import { graphWidgetLineTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetLineChart/states/graphWidgetLineTooltipComponentState';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { calculateValueRangeFromLineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/calculateValueRangeFromLineChartSeries';
import { getLineChartAxisBottomConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisBottomConfig';
import { getLineChartAxisLeftConfig } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/getLineChartAxisLeftConfig';
import { computeEffectiveValueRange } from '@/page-layout/widgets/graph/utils/computeEffectiveValueRange';
import { computeValueTickValues } from '@/page-layout/widgets/graph/utils/computeValueTickValues';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ResponsiveLine,
  type LineCustomSvgLayerProps,
  type LineSeries,
  type Point,
  type SliceTooltipProps,
} from '@nivo/line';
import { useCallback, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

type CrosshairLayerProps = LineCustomSvgLayerProps<LineSeries>;
type PointLabelsLayerProps = LineCustomSvgLayerProps<LineSeries>;
type StackedAreasLayerProps = LineCustomSvgLayerProps<LineSeries>;
type LinesLayerProps = LineCustomSvgLayerProps<LineSeries>;
type NoDataLayerWrapperProps = LineCustomSvgLayerProps<LineSeries>;

type GraphWidgetLineChartProps = {
  data: LineChartSeries[];
  showLegend?: boolean;
  showGrid?: boolean;
  enablePointLabel?: boolean;
  xAxisLabel?: string;
  enableArea?: boolean;
  yAxisLabel?: string;
  id: string;
  rangeMin?: number;
  rangeMax?: number;
  omitNullValues?: boolean;
  groupMode?: 'stacked';
  onSliceClick?: (point: Point<LineSeries>) => void;
} & GraphValueFormatOptions;

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
  enableArea = true,
  enablePointLabel = false,
  xAxisLabel,
  yAxisLabel,
  id,
  rangeMin,
  rangeMax,
  omitNullValues: _omitNullValues = false,
  displayType,
  groupMode,
  decimals,
  prefix,
  suffix,
  customFormatter,
  onSliceClick,
}: GraphWidgetLineChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);
  const chartTheme = useLineChartTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  const formatOptions: GraphValueFormatOptions = {
    displayType,
    decimals,
    prefix,
    suffix,
    customFormatter,
  };

  const { enrichedSeries, nivoData, colors, legendItems, visibleData } =
    useLineChartData({
      data,
      colorRegistry,
      id,
    });

  const calculatedValueRange =
    calculateValueRangeFromLineChartSeries(visibleData);

  const hasNoData =
    visibleData.length === 0 ||
    visibleData.every((series) => series.data.length === 0);

  const { effectiveMinimumValue, effectiveMaximumValue } =
    computeEffectiveValueRange({
      calculatedMinimum: calculatedValueRange.minimum,
      calculatedMaximum: calculatedValueRange.maximum,
      rangeMin,
      rangeMax,
    });

  const hasClickableItems = isDefined(onSliceClick);

  const setActiveLineTooltip = useSetRecoilComponentState(
    graphWidgetLineTooltipComponentState,
  );

  const setCrosshairX = useSetRecoilComponentState(
    graphWidgetLineCrosshairXComponentState,
  );

  const hideTooltip = useCallback(() => {
    setActiveLineTooltip(null);
    setCrosshairX(null);
  }, [setActiveLineTooltip, setCrosshairX]);

  const debouncedHideTooltip = useDebouncedCallback(hideTooltip, 300);

  const handleTooltipMouseEnter = () => {
    debouncedHideTooltip.cancel();
  };

  const handleTooltipMouseLeave = debouncedHideTooltip;

  const handleSliceLeave = () => {
    debouncedHideTooltip();
  };

  const handleSliceEnter = (sliceData: SliceHoverData) => {
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

    const offsetLeft = sliceData.nearestSlice.x + marginLeft;
    const offsetTop = sliceData.mouseY + COMMON_CHART_CONSTANTS.MARGIN_TOP;

    debouncedHideTooltip.cancel();
    setCrosshairX(sliceData.sliceX);
    setActiveLineTooltip({
      slice,
      offsetLeft,
      offsetTop,
      highlightedSeriesId: String(sliceData.closestPoint.seriesId),
    });
  };

  const PointLabelsLayer = (layerProps: PointLabelsLayerProps) => {
    if (hasNoData) {
      return null;
    }

    return (
      <CustomPointLabelsLayer
        points={layerProps.points}
        formatValue={(value) => formatGraphValue(value, formatOptions)}
        offset={theme.spacingMultiplicator * 2}
        groupMode={groupMode}
        omitNullValues={_omitNullValues}
        enablePointLabel={enablePointLabel}
      />
    );
  };

  const CrosshairLayer = (layerProps: CrosshairLayerProps) => {
    if (hasNoData) {
      return null;
    }

    return (
      <CustomCrosshairLayer
        key="custom-crosshair-layer"
        points={layerProps.points}
        innerHeight={layerProps.innerHeight}
        innerWidth={layerProps.innerWidth}
        marginLeft={marginLeft}
        marginTop={COMMON_CHART_CONSTANTS.MARGIN_TOP}
        onSliceHover={handleSliceEnter}
        onSliceClick={
          isDefined(onSliceClick)
            ? (sliceData) => onSliceClick(sliceData.closestPoint)
            : undefined
        }
        onRectLeave={handleSliceLeave}
      />
    );
  };

  const StackedAreasLayer = (layerProps: StackedAreasLayerProps) => {
    if (hasNoData) {
      return null;
    }

    return (
      <CustomStackedAreasLayer
        series={layerProps.series}
        innerHeight={layerProps.innerHeight}
        enrichedSeries={enrichedSeries}
        enableArea={enableArea}
        yScale={layerProps.yScale}
        isStacked={groupMode === 'stacked'}
      />
    );
  };

  const LinesLayer = (layerProps: LinesLayerProps) => {
    if (hasNoData) {
      return null;
    }

    return (
      <CustomLinesLayer
        series={layerProps.series}
        lineGenerator={layerProps.lineGenerator}
        lineWidth={layerProps.lineWidth}
      />
    );
  };

  const NoDataLayerWrapper = (layerProps: NoDataLayerWrapperProps) => (
    <NoDataLayer
      innerWidth={layerProps.innerWidth}
      innerHeight={layerProps.innerHeight}
      hasNoData={hasNoData}
    />
  );

  const marginLeft = isDefined(yAxisLabel)
    ? COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITH_LABEL
    : COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITHOUT_LABEL;

  const { config: axisBottomConfig, marginBottom } =
    getLineChartAxisBottomConfig(xAxisLabel, chartWidth, data, marginLeft);

  const { tickValues: valueTickValues, domain: valueDomain } =
    computeValueTickValues({
      minimum: effectiveMinimumValue,
      maximum: effectiveMaximumValue,
      tickCount: LINE_CHART_CONSTANTS.DEFAULT_TICK_COUNT,
    });

  const axisLeftConfig = getLineChartAxisLeftConfig(
    yAxisLabel,
    formatOptions,
    valueTickValues,
  );

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        $isClickable={hasClickableItems}
        onMouseLeave={() => debouncedHideTooltip()}
        ref={containerRef}
      >
        <NodeDimensionEffect
          elementRef={containerRef}
          onDimensionChange={({ width }) => {
            setChartWidth(width);
          }}
        />
        <ResponsiveLine
          data={nivoData}
          margin={{
            top: COMMON_CHART_CONSTANTS.MARGIN_TOP,
            right: COMMON_CHART_CONSTANTS.MARGIN_RIGHT,
            bottom: marginBottom,
            left: marginLeft,
          }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: valueDomain.min,
            max: valueDomain.max,
            stacked: groupMode === 'stacked',
            clamp: true,
          }}
          curve={'monotoneX'}
          lineWidth={1}
          enablePoints={true}
          pointSize={0}
          enablePointLabel={false}
          pointBorderWidth={0}
          colors={colors}
          axisTop={null}
          axisRight={null}
          axisBottom={axisBottomConfig}
          axisLeft={axisLeftConfig}
          enableGridX={showGrid}
          enableGridY={showGrid}
          gridYValues={valueTickValues}
          enableSlices={'x'}
          sliceTooltip={() => null}
          tooltip={() => null}
          layers={[
            'grid',
            'markers',
            'axes',
            StackedAreasLayer,
            LinesLayer,
            CrosshairLayer,
            'points',
            PointLabelsLayer,
            'legends',
            NoDataLayerWrapper,
          ]}
          theme={chartTheme}
        />
      </GraphWidgetChartContainer>
      <GraphLineChartTooltip
        containerRef={containerRef}
        enrichedSeries={enrichedSeries}
        formatOptions={formatOptions}
        onSliceClick={onSliceClick}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      />
      <GraphWidgetLegend
        show={showLegend && data.length > 0}
        items={legendItems}
      />
    </StyledContainer>
  );
};
