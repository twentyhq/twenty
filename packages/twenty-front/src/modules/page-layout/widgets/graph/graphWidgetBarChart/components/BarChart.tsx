import { AxisLayer } from '@/page-layout/widgets/graph/chart-core/layers/AxisLayer';
import { getPointerPosition } from '@/page-layout/widgets/graph/chart-core/utils/getPointerPosition';
import { isPointInChartArea } from '@/page-layout/widgets/graph/chart-core/utils/isPointInChartArea';
import { NoDataLayer } from '@/page-layout/widgets/graph/components/NoDataLayer';
import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { BarChartBaseLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartBaseLayer';
import { BarChartHoverLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartHoverLayer';
import { BarChartTotalsLayer } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartTotalsLayer';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { useBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarPositions';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { computeAllCategorySlices } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeAllCategorySlices';
import { computeSliceTooltipPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeSliceTooltipPosition';
import { findSliceAtPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findSliceAtPosition';
import { hasNegativeValuesInData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/hasNegativeValuesInData';
import { getBarChartInnerPadding } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartInnerPadding';
import { getBarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartLayout';
import { getBarChartTickConfig } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickConfig';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { resolveAxisFontSizes } from '@/page-layout/widgets/graph/utils/resolveAxisFontSizes';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useMemo, type MouseEvent } from 'react';
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

  const fallbackColor = theme.border.color.light;
  const isVertical = layout === BarChartLayout.VERTICAL;

  const chartTheme = useBarChartTheme();
  const { tickFontSize, legendFontSize } = resolveAxisFontSizes(
    chartTheme.axis,
  );

  const { margins, axisLeftConfiguration, valueTickValues, valueDomain } =
    getBarChartLayout({
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

  const tickConfig = getBarChartTickConfig({
    axisFontSize: tickFontSize,
    data,
    height: chartHeight,
    indexBy,
    layout,
    margins,
    width: chartWidth,
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

  const categoryTickValues = (() => {
    if (isVertical) {
      return tickConfig.categoryTickValues;
    }
    const leftTickValues = axisLeftConfiguration?.tickValues;
    if (Array.isArray(leftTickValues)) {
      return leftTickValues;
    }
    return tickConfig.categoryTickValues;
  })();

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

  const bars = useBarPositions({
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
    fallbackColor,
    innerPadding,
  });

  const labelBarsWithZeros = useBarPositions({
    chartHeight,
    chartWidth,
    data,
    enrichedKeysMap,
    fallbackColor,
    groupMode,
    includeZeroValues: true,
    indexBy,
    innerPadding,
    keys,
    layout,
    margins,
    valueDomain,
    enabled: showValues && !hasNoData && !omitNullValues,
  });

  const labelBars = omitNullValues ? bars : labelBarsWithZeros;

  const slices = useMemo(
    () =>
      computeAllCategorySlices({
        data,
        indexBy,
        bars,
        isVerticalLayout: isVertical,
        chartWidth,
        chartHeight,
        margins,
      }),
    [data, indexBy, bars, isVertical, chartWidth, chartHeight, margins],
  );

  const hoveredSlice = isDefined(hoveredSliceIndexValue)
    ? (slices.find((slice) => slice.indexValue === hoveredSliceIndexValue) ??
      null)
    : null;

  const innerWidth = chartWidth - margins.left - margins.right;
  const innerHeight = chartHeight - margins.top - margins.bottom;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { x, y } = getPointerPosition({
      event,
      element: event.currentTarget,
    });

    const relativeX = x - margins.left;
    const relativeY = y - margins.top;

    if (
      !isPointInChartArea({
        x: relativeX,
        y: relativeY,
        innerWidth,
        innerHeight,
      })
    ) {
      if (isDefined(hoveredSliceIndexValue)) {
        onSliceHover(null);
      }
      return;
    }

    const slice = findSliceAtPosition({
      mouseX: relativeX,
      mouseY: relativeY,
      slices,
      isVerticalLayout: isVertical,
    });

    if (!isDefined(slice)) {
      if (isDefined(hoveredSliceIndexValue)) {
        onSliceHover(null);
      }
      return;
    }

    if (slice.indexValue === hoveredSliceIndexValue) {
      return;
    }

    const { offsetLeft, offsetTop } = computeSliceTooltipPosition({
      slice,
      margins,
      innerHeight,
      isVertical,
    });

    onSliceHover({
      slice,
      offsetLeft,
      offsetTop,
    });
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!isDefined(onSliceClick)) {
      return;
    }

    const { x, y } = getPointerPosition({
      event,
      element: event.currentTarget,
    });

    const relativeX = x - margins.left;
    const relativeY = y - margins.top;

    if (
      !isPointInChartArea({
        x: relativeX,
        y: relativeY,
        innerWidth,
        innerHeight,
      })
    ) {
      return;
    }

    const slice = findSliceAtPosition({
      mouseX: relativeX,
      mouseY: relativeY,
      slices,
      isVerticalLayout: isVertical,
    });

    if (isDefined(slice)) {
      onSliceClick(slice);
    }
  };

  return (
    <StyledCanvasContainer
      $isClickable={isDefined(onSliceClick)}
      onMouseMove={handleMouseMove}
      onMouseLeave={onSliceLeave}
      onClick={handleClick}
    >
      <BarChartBaseLayer
        bars={bars}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        highlightedLegendId={highlightedLegendId}
        layout={layout}
        margins={margins}
        showGrid={showGrid}
        valueDomain={valueDomain}
        valueTickValues={valueTickValues}
        allowDataTransitions={allowDataTransitions}
      />
      <BarChartHoverLayer
        hoveredSlice={hoveredSlice}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        layout={layout}
        margins={margins}
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
