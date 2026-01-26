import { isSidePanelAnimatingState } from '@/command-menu/states/isSidePanelAnimatingState';
import { pageLayoutDraggingWidgetIdComponentState } from '@/page-layout/states/pageLayoutDraggingWidgetIdComponentState';
import { pageLayoutResizingWidgetIdComponentState } from '@/page-layout/states/pageLayoutResizingWidgetIdComponentState';
import { AxisLayer } from '@/page-layout/widgets/graph/chart-core/layers/AxisLayer';
import { GraphWidgetChartContainer } from '@/page-layout/widgets/graph/components/GraphWidgetChartContainer';
import { GraphWidgetLegend } from '@/page-layout/widgets/graph/components/GraphWidgetLegend';
import { NoDataLayer } from '@/page-layout/widgets/graph/components/NoDataLayer';
import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { BarChart } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChart';
import { BarChartTooltip } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartTooltip';
import { BarChartTotalsLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartTotalsLayer';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { useBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarPositions';
import { graphWidgetBarTooltipComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetBarTooltipComponentState';
import { graphWidgetHoveredSliceIndexComponentState } from '@/page-layout/widgets/graph/graphWidgetBarChart/states/graphWidgetHoveredSliceIndexComponentState';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSeries';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { calculateStackedBarChartValueRange } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateStackedBarChartValueRange';
import { calculateValueRangeFromBarChartKeys } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/calculateValueRangeFromBarChartKeys';
import { getBarChartInnerPadding } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartInnerPadding';
import { getBarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartLayout';
import { getBarChartTickConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import { type GraphColorMode } from '@/page-layout/widgets/graph/types/GraphColorMode';
import { computeEffectiveValueRange } from '@/page-layout/widgets/graph/utils/computeEffectiveValueRange';
import { createGraphColorRegistry } from '@/page-layout/widgets/graph/utils/createGraphColorRegistry';
import { resolveAxisFontSizes } from '@/page-layout/widgets/graph/utils/resolveAxisFontSizes';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { NodeDimensionEffect } from '@/ui/utilities/dimensions/components/NodeDimensionEffect';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import { BarChartLayout } from '~/generated/graphql';

type GraphWidgetBarChartProps = {
  colorMode: GraphColorMode;
  data: BarChartDatum[];
  groupMode?: 'grouped' | 'stacked';
  id: string;
  indexBy: string;
  keys: string[];
  layout?: BarChartLayout;
  omitNullValues?: boolean;
  onSliceClick?: (slice: BarChartSlice) => void;
  rangeMax?: number;
  rangeMin?: number;
  series?: BarChartSeriesWithColor[];
  seriesLabels?: Record<string, string>;
  showGrid?: boolean;
  showLegend?: boolean;
  showValues?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
} & GraphValueFormatOptions;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const StyledChartWrapper = styled.div`
  height: 100%;
  position: relative;
  width: 100%;
`;

const StyledNoDataOverlay = styled.svg`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
`;

export const GraphWidgetBarChart = ({
  data,
  indexBy,
  keys,
  series,
  showLegend = true,
  showGrid = true,
  showValues = false,
  xAxisLabel,
  yAxisLabel,
  id,
  layout = BarChartLayout.VERTICAL,
  groupMode = 'grouped',
  colorMode,
  seriesLabels,
  rangeMin,
  rangeMax,
  omitNullValues = false,
  displayType,
  decimals,
  prefix,
  suffix,
  customFormatter,
  onSliceClick,
}: GraphWidgetBarChartProps) => {
  const theme = useTheme();
  const colorRegistry = createGraphColorRegistry(theme);

  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartHeight, setChartHeight] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const setActiveBarTooltip = useSetRecoilComponentState(
    graphWidgetBarTooltipComponentState,
  );

  const setHoveredSliceIndex = useSetRecoilComponentState(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const hoveredSliceIndexValue = useRecoilComponentValue(
    graphWidgetHoveredSliceIndexComponentState,
  );

  const draggingWidgetId = useRecoilComponentValue(
    pageLayoutDraggingWidgetIdComponentState,
  );

  const resizingWidgetId = useRecoilComponentValue(
    pageLayoutResizingWidgetIdComponentState,
  );

  const isSidePanelAnimating = useRecoilValue(isSidePanelAnimatingState);

  const isLayoutAnimating =
    isSidePanelAnimating || draggingWidgetId === id || resizingWidgetId === id;

  const allowDataTransitions = !isLayoutAnimating;

  const formatOptions: GraphValueFormatOptions = {
    customFormatter,
    decimals,
    displayType,
    prefix,
    suffix,
  };

  const chartTheme = useBarChartTheme();
  const { tickFontSize, legendFontSize } = resolveAxisFontSizes(
    chartTheme.axis,
  );

  const { enrichedKeysMap, enrichedKeys, legendItems, visibleKeys } =
    useBarChartData({ keys, series, colorRegistry, seriesLabels, colorMode });

  const orderedKeys =
    groupMode === 'stacked' && layout === BarChartLayout.VERTICAL
      ? visibleKeys.toReversed()
      : visibleKeys;

  const calculatedValueRange =
    groupMode === 'stacked'
      ? calculateStackedBarChartValueRange(data, visibleKeys)
      : calculateValueRangeFromBarChartKeys(data, visibleKeys);

  const hasNoData = data.length === 0 || visibleKeys.length === 0;

  const { effectiveMinimumValue, effectiveMaximumValue } =
    computeEffectiveValueRange({
      calculatedMaximum: calculatedValueRange.maximum,
      calculatedMinimum: calculatedValueRange.minimum,
      rangeMax,
      rangeMin,
    });

  const { margins, axisLeftConfiguration, valueTickValues, valueDomain } =
    getBarChartLayout({
      axisTheme: chartTheme.axis,
      chartHeight,
      chartWidth,
      data,
      effectiveMaximumValue,
      effectiveMinimumValue,
      formatOptions,
      indexBy,
      layout,
      xAxisLabel,
      yAxisLabel,
    });

  const tickConfig = getBarChartTickConfig({
    axisFontSize: tickFontSize,
    data,
    height: chartHeight,
    indexBy,
    layout,
    margins,
    width: chartWidth,
  });

  const isVertical = layout === BarChartLayout.VERTICAL;

  const categoryValues = useMemo(
    () => data.map((item) => String(item[indexBy] ?? '')),
    [data, indexBy],
  );

  const innerPadding = getBarChartInnerPadding({
    chartHeight,
    chartWidth,
    dataLength: data.length,
    groupMode,
    keysLength: visibleKeys.length,
    layout,
    margins,
  });

  const bars = useBarPositions({
    chartHeight,
    chartWidth,
    data,
    enrichedKeysMap,
    fallbackColor: theme.border.color.light,
    groupMode,
    indexBy,
    innerPadding,
    keys: orderedKeys,
    layout,
    margins,
    valueDomain,
  });

  const labelBarsWithZeros = useBarPositions({
    chartHeight,
    chartWidth,
    data,
    enrichedKeysMap,
    fallbackColor: theme.border.color.light,
    groupMode,
    includeZeroValues: true,
    indexBy,
    innerPadding,
    keys: orderedKeys,
    layout,
    margins,
    valueDomain,
    enabled: showValues && !hasNoData && !omitNullValues,
  });

  const labelBars = omitNullValues ? bars : labelBarsWithZeros;

  const hasClickableItems = isDefined(onSliceClick);
  const hasNegativeValues = calculatedValueRange.minimum < 0;

  const hideTooltip = () => {
    setActiveBarTooltip(null);
    setHoveredSliceIndex(null);
  };

  const debouncedHideTooltip = useDebouncedCallback(hideTooltip, 300);

  const handleTooltipMouseEnter = () => {
    debouncedHideTooltip.cancel();
  };

  const handleTooltipMouseLeave = debouncedHideTooltip;

  const handleSliceHover = (
    sliceData: {
      slice: BarChartSlice;
      offsetLeft: number;
      offsetTop: number;
    } | null,
  ) => {
    if (isDefined(sliceData)) {
      debouncedHideTooltip.cancel();
      setHoveredSliceIndex(sliceData.slice.indexValue);
      setActiveBarTooltip({
        offsetLeft: sliceData.offsetLeft,
        offsetTop: sliceData.offsetTop,
        slice: sliceData.slice,
      });
    } else {
      debouncedHideTooltip();
    }
  };

  const handleSliceLeave = () => {
    debouncedHideTooltip();
  };

  const categoryTickValues = useMemo(() => {
    if (isVertical) {
      return tickConfig.categoryTickValues;
    }
    const leftTickValues = axisLeftConfiguration?.tickValues;
    if (Array.isArray(leftTickValues)) {
      return leftTickValues;
    }
    return tickConfig.categoryTickValues;
  }, [tickConfig.categoryTickValues, axisLeftConfiguration, isVertical]);

  const formatBottomTick = (value: string | number): string => {
    if (isVertical) {
      return truncateTickLabel(
        String(value),
        tickConfig.maxBottomAxisTickLabelLength,
      );
    }
    return truncateTickLabel(
      formatGraphValue(Number(value), formatOptions),
      tickConfig.maxBottomAxisTickLabelLength,
    );
  };

  const formatLeftTick = (value: string | number): string => {
    if (isVertical) {
      return truncateTickLabel(
        formatGraphValue(Number(value), formatOptions),
        tickConfig.maxLeftAxisTickLabelLength,
      );
    }
    return truncateTickLabel(
      String(value),
      tickConfig.maxLeftAxisTickLabelLength,
    );
  };

  const axisConfig = {
    tickFontSize,
    legendFontSize,
    tickPadding: BAR_CHART_CONSTANTS.TICK_PADDING,
    rotatedLabelsExtraMargin:
      BAR_CHART_CONSTANTS.ROTATED_LABELS_EXTRA_BOTTOM_MARGIN,
    bottomAxisLegendOffset: BAR_CHART_CONSTANTS.BOTTOM_AXIS_LEGEND_OFFSET,
    leftAxisLegendOffsetPadding:
      BAR_CHART_CONSTANTS.LEFT_AXIS_LEGEND_OFFSET_PADDING,
    legendOffsetMarginBuffer:
      COMMON_CHART_CONSTANTS.LEGEND_OFFSET_MARGIN_BUFFER,
    categoryPadding: BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO,
    categoryOuterPaddingPx: BAR_CHART_CONSTANTS.OUTER_PADDING_PX,
  };

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;

  return (
    <StyledContainer id={id}>
      <GraphWidgetChartContainer
        ref={containerRef}
        $isClickable={hasClickableItems}
        $cursorSelector="canvas"
      >
        <NodeDimensionEffect
          elementRef={containerRef}
          onDimensionChange={({ height, width }) => {
            setChartHeight(height);
            setChartWidth(width);
          }}
        />
        <StyledChartWrapper>
          {chartWidth > 0 && chartHeight > 0 && (
            <>
              <BarChart
                allowDataTransitions={allowDataTransitions}
                chartHeight={chartHeight}
                chartWidth={chartWidth}
                data={data}
                enrichedKeysMap={enrichedKeysMap}
                groupMode={groupMode}
                hoveredSliceIndexValue={hoveredSliceIndexValue}
                indexBy={indexBy}
                innerPadding={innerPadding}
                keys={orderedKeys}
                layout={layout}
                margins={margins}
                onSliceClick={onSliceClick}
                onSliceHover={handleSliceHover}
                onSliceLeave={handleSliceLeave}
                showGrid={showGrid}
                valueDomain={valueDomain}
                valueTickValues={valueTickValues}
              />
              <AxisLayer
                bottomAxisTickRotation={tickConfig.bottomAxisTickRotation}
                categoryValues={categoryValues}
                categoryTickValues={categoryTickValues}
                chartHeight={chartHeight}
                chartWidth={chartWidth}
                formatBottomTick={formatBottomTick}
                formatLeftTick={formatLeftTick}
                hasNegativeValues={hasNegativeValues}
                isVertical={isVertical}
                margins={margins}
                axisConfig={axisConfig}
                valueDomain={valueDomain}
                valueTickValues={valueTickValues}
                xAxisLabel={xAxisLabel}
                yAxisLabel={yAxisLabel}
              />
              <BarChartTotalsLayer
                bars={labelBars}
                chartHeight={chartHeight}
                chartWidth={chartWidth}
                formatValue={(value) => formatGraphValue(value, formatOptions)}
                groupMode={groupMode}
                layout={layout}
                margins={margins}
                offset={theme.spacingMultiplicator * 2}
                omitNullValues={omitNullValues}
                showValues={showValues && !hasNoData}
              />
              {hasNoData && (
                <StyledNoDataOverlay>
                  <g transform={`translate(${margins.left}, ${margins.top})`}>
                    <NoDataLayer
                      hasNoData={hasNoData}
                      innerHeight={innerHeight}
                      innerWidth={innerWidth}
                    />
                  </g>
                </StyledNoDataOverlay>
              )}
            </>
          )}
        </StyledChartWrapper>
      </GraphWidgetChartContainer>

      <BarChartTooltip
        containerRef={containerRef}
        data={data}
        enrichedKeys={enrichedKeys}
        formatOptions={formatOptions}
        indexBy={indexBy}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
        onSliceClick={onSliceClick}
      />
      <GraphWidgetLegend
        items={legendItems}
        show={showLegend && data.length > 0 && keys.length > 0}
      />
    </StyledContainer>
  );
};
