import { BarChartLayers } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartLayers';
import { useBarChartTheme } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartTheme';
import { useMemoizedBarPositions } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useMemoizedBarPositions';
import { useBarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartLayout';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDatum';
import { type BarChartEnrichedKey } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartEnrichedKey';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarChartSliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSliceHoverData';
import { computeAllCategorySlices } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeAllCategorySlices';
import { getSliceHoverDataFromMouseEvent } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getSliceHoverDataFromMouseEvent';
import { hasNegativeValuesInData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/hasNegativeValuesInData';
import { graphWidgetHighlightedLegendIdComponentState } from '@/page-layout/widgets/graph/states/graphWidgetHighlightedLegendIdComponentState';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated-metadata/graphql';

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
  onSliceHover: (data: BarChartSliceHoverData | null) => void;
  onSliceClick?: (slice: BarChartSlice) => void;
  onSliceLeave: () => void;
  allowDataTransitions: boolean;
  hasNoData?: boolean;
};

const StyledCanvasContainer = styled.div<{ isClickable: boolean }>`
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  height: 100%;
  position: relative;
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

  const chartTheme = useBarChartTheme();
  const {
    axisBottomConfiguration,
    axisLayerConfig,
    categoryValues,
    formatBottomTick,
    formatLeftTick,
    innerHeight,
    innerPadding,
    innerWidth,
    margins,
    resolvedCategoryTickValues,
    valueDomain,
    valueTickValues,
  } = useBarChartLayout({
    axisTheme: chartTheme.axis,
    axisConfig,
    chartHeight,
    chartWidth,
    data,
    effectiveValueRange,
    formatOptions,
    groupMode,
    indexBy,
    keys,
    layout,
  });

  const isVerticalLayout = layout === BarChartLayout.VERTICAL;

  const hasNegativeValues = hasNegativeValuesInData(data, keys);

  const showGrid = axisConfig?.showGrid ?? true;
  const showValues = dataLabelsConfig?.show ?? false;
  const omitNullValues = dataLabelsConfig?.omitNullValues ?? false;
  const showTotalsValues = showValues && !hasNoData;

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
    isVerticalLayout: isVerticalLayout,
    chartWidth,
    chartHeight,
    margins,
  });

  const hoveredSlice = isDefined(hoveredSliceIndexValue)
    ? (slices.find((slice) => slice.indexValue === hoveredSliceIndexValue) ??
      null)
    : null;

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const sliceHoverData = getSliceHoverDataFromMouseEvent({
      event,
      margins,
      innerWidth,
      innerHeight,
      slices,
      isVerticalLayout,
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

    const sliceHoverData = getSliceHoverDataFromMouseEvent({
      event,
      margins,
      innerWidth,
      innerHeight,
      slices,
      isVerticalLayout,
    });

    if (isDefined(sliceHoverData)) {
      onSliceClick(sliceHoverData.slice);
    }
  };
  const formatValue = (value: number) => formatGraphValue(value, formatOptions);

  return (
    <StyledCanvasContainer
      isClickable={isDefined(onSliceClick)}
      onMouseMove={handleMouseMove}
      onMouseLeave={onSliceLeave}
      onClick={handleClick}
    >
      <BarChartLayers
        allowDataTransitions={allowDataTransitions}
        axisBottomTickRotation={axisBottomConfiguration.tickRotation}
        axisConfig={axisLayerConfig}
        bars={bars}
        categoryValues={categoryValues}
        categoryTickValues={resolvedCategoryTickValues}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        formatBottomTick={formatBottomTick}
        formatLeftTick={formatLeftTick}
        formatValue={formatValue}
        groupMode={groupMode}
        hasNegativeValues={hasNegativeValues}
        hasNoData={hasNoData}
        highlightedLegendId={highlightedLegendId}
        hoveredSlice={hoveredSlice}
        innerHeight={innerHeight}
        innerWidth={innerWidth}
        labelBars={labelBars}
        layout={layout}
        margins={margins}
        omitNullValues={omitNullValues}
        offset={theme.spacingMultiplicator * 2}
        showGrid={showGrid}
        showValues={showTotalsValues}
        valueDomain={valueDomain}
        valueTickValues={valueTickValues}
        xAxisLabel={axisConfig?.xAxisLabel}
        yAxisLabel={axisConfig?.yAxisLabel}
      />
    </StyledCanvasContainer>
  );
};
