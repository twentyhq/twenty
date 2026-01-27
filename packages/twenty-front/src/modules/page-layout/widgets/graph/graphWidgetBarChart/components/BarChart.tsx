import { AxisLayer } from '@/page-layout/widgets/graph/chart-core/layers/AxisLayer';
import { getPointerPosition } from '@/page-layout/widgets/graph/chart-core/utils/getPointerPosition';
import { NoDataLayer } from '@/page-layout/widgets/graph/components/NoDataLayer';
import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { BarChartBaseLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartBaseLayer';
import { BarChartHoverLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartHoverLayer';
import { BarChartTotalsLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartTotalsLayer';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { useMemoizedBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useMemoizedBarPositions';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { computeAllCategorySlices } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeAllCategorySlices';
import { getBarChartInnerPadding } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartInnerPadding';
import { getBarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartLayout';
import { getSliceHoverDataFromPointerPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getSliceHoverDataFromPointerPosition';
import { hasNegativeValuesInData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/hasNegativeValuesInData';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { resolveAxisFontSizes } from '@/page-layout/widgets/graph/utils/resolveAxisFontSizes';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type SliceHoverData = {
  slice: BarChartSlice;
  offsetLeft: number;
  offsetTop: number;
};

type BarChartProps = {
  data: BarChartDatum[];
  indexBy: string;
  keys: string[];
  enrichedKeysMap: Map<string, BarChartEnrichedKey>;
  chartWidth: number;
  chartHeight: number;
  layout: BarChartLayout;
  groupMode: 'grouped' | 'stacked';
  effectiveValueRange: { minimum: number; maximum: number };
  formatOptions: GraphValueFormatOptions;
  axisConfig?: {
    xAxisLabel?: string;
    yAxisLabel?: string;
    showGrid?: boolean;
  };
  dataLabelsConfig?: {
    show: boolean;
    omitNullValues: boolean;
  };
  hoveredSliceIndexValue: string | null;
  onSliceHover: (data: SliceHoverData | null) => void;
  onSliceClick?: (slice: BarChartSlice) => void;
  onSliceLeave: () => void;
  allowDataTransitions: boolean;
  hasNoData?: boolean;
};

const StyledCanvasContainer = styled.div<{ $isClickable: boolean }>`
  cursor: ${({ $isClickable }) => ($isClickable ? 'pointer' : 'default')};
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

export const BarChart = ({
  data,
  indexBy,
  keys,
  enrichedKeysMap,
  chartWidth,
  chartHeight,
  layout,
  groupMode,
  effectiveValueRange,
  formatOptions,
  axisConfig,
  dataLabelsConfig,
  hoveredSliceIndexValue,
  onSliceHover,
  onSliceClick,
  onSliceLeave,
  allowDataTransitions,
  hasNoData = false,
}: BarChartProps) => {
  const theme = useTheme();
  const highlightedLegendId = useRecoilComponentValue(
    graphWidgetHighlightedLegendIdComponentState,
  );

  const isVertical = layout === BarChartLayout.VERTICAL;

  const chartTheme = useBarChartTheme();
  const { tickFontSize, legendFontSize } = resolveAxisFontSizes(
    chartTheme.axis,
  );

  const {
    margins,
    axisBottomConfiguration,
    axisLeftConfiguration,
    valueTickValues,
    valueDomain,
  } = getBarChartLayout({
    axisTheme: chartTheme.axis,
    chartHeight,
    chartWidth,
    data,
    effectiveMaximumValue: effectiveValueRange.maximum,
    effectiveMinimumValue: effectiveValueRange.minimum,
    formatOptions,
    indexBy,
    layout,
    xAxisLabel: axisConfig?.xAxisLabel,
    yAxisLabel: axisConfig?.yAxisLabel,
  });

  const innerPadding = getBarChartInnerPadding({
    chartHeight,
    chartWidth,
    dataLength: data.length,
    groupMode,
    keysLength: keys.length,
    layout,
    margins,
  });

  const categoryValues = data.map((item) => String(item[indexBy] ?? ''));

  const categoryTickValues = isVertical
    ? axisBottomConfiguration.tickValues
    : axisLeftConfiguration.tickValues;
  const resolvedCategoryTickValues = Array.isArray(categoryTickValues)
    ? categoryTickValues
    : categoryValues;

  const formatBottomTick = (value: string | number): string => {
    const formattedValue = axisBottomConfiguration.format?.(
      isVertical ? value : Number(value),
    );
    return String(formattedValue ?? value);
  };

  const formatLeftTick = (value: string | number): string => {
    const formattedValue = axisLeftConfiguration.format?.(
      isVertical ? Number(value) : value,
    );
    return String(formattedValue ?? value);
  };

  const axisLayerConfig = {
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

  const hasNegativeValues = hasNegativeValuesInData(data, keys);

  const showGrid = axisConfig?.showGrid ?? true;
  const showValues = dataLabelsConfig?.show ?? false;
  const omitNullValues = dataLabelsConfig?.omitNullValues ?? false;

  const shouldIncludeZeroValuesForLabels =
    showValues && !hasNoData && !omitNullValues;

  const barsWithOptionalZeroValues = useMemoizedBarPositions({
    data,
    indexBy,
    keys,
    enrichedKeysMap,
    chartWidth,
    chartHeight,
    margins,
    layout,
    groupMode,
    valueDomain,
    innerPadding,
    includeZeroValues: shouldIncludeZeroValuesForLabels,
  });

  const bars = shouldIncludeZeroValuesForLabels
    ? barsWithOptionalZeroValues.filter((bar) => bar.value !== 0)
    : barsWithOptionalZeroValues;

  const labelBars = shouldIncludeZeroValuesForLabels
    ? barsWithOptionalZeroValues
    : bars;

  const slices = computeAllCategorySlices({
    data,
    indexBy,
    bars,
    isVerticalLayout: isVertical,
    chartWidth,
    chartHeight,
    margins,
  });

  const hoveredSlice = isDefined(hoveredSliceIndexValue)
    ? (slices.find((slice) => slice.indexValue === hoveredSliceIndexValue) ??
      null)
    : null;

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { x: pointerPositionX, y: pointerPositionY } = getPointerPosition({
      event,
      element: event.currentTarget,
    });

    const sliceHoverData = getSliceHoverDataFromPointerPosition({
      pointerPositionX,
      pointerPositionY,
      margins,
      innerWidth,
      innerHeight,
      slices,
      isVerticalLayout: isVertical,
    });

    if (!isDefined(sliceHoverData)) {
      if (isDefined(hoveredSliceIndexValue)) {
        onSliceHover(null);
      }
      return;
    }

    if (sliceHoverData.slice.indexValue === hoveredSliceIndexValue) {
      return;
    }

    onSliceHover(sliceHoverData);
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDefined(onSliceClick)) {
      return;
    }

    const { x: pointerPositionX, y: pointerPositionY } = getPointerPosition({
      event,
      element: event.currentTarget,
    });

    const sliceHoverData = getSliceHoverDataFromPointerPosition({
      pointerPositionX,
      pointerPositionY,
      margins,
      innerWidth,
      innerHeight,
      slices,
      isVerticalLayout: isVertical,
    });

    if (isDefined(sliceHoverData)) {
      onSliceClick(sliceHoverData.slice);
    }
  };

  return (
    <StyledCanvasContainer
      $isClickable={isDefined(onSliceClick)}
      onMouseMove={handleMouseMove}
      onMouseLeave={onSliceLeave}
      onClick={handleClick}
    >
      <BarChartHoverLayer
        hoveredSlice={hoveredSlice}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        layout={layout}
        margins={margins}
      />
      <BarChartBaseLayer
        bars={bars}
        highlightedLegendId={highlightedLegendId}
        showGrid={showGrid}
        valueDomain={valueDomain}
        valueTickValues={valueTickValues}
        allowDataTransitions={allowDataTransitions}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        layout={layout}
        margins={margins}
      />
      <AxisLayer
        bottomAxisTickRotation={axisBottomConfiguration.tickRotation}
        categoryValues={categoryValues}
        categoryTickValues={resolvedCategoryTickValues}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        formatBottomTick={formatBottomTick}
        formatLeftTick={formatLeftTick}
        hasNegativeValues={hasNegativeValues}
        isVertical={isVertical}
        margins={margins}
        axisConfig={axisLayerConfig}
        valueDomain={valueDomain}
        valueTickValues={valueTickValues}
        xAxisLabel={axisConfig?.xAxisLabel}
        yAxisLabel={axisConfig?.yAxisLabel}
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
    </StyledCanvasContainer>
  );
};
