import { type AxisLayerConfig } from '@/page-layout/widgets/graph/chart-core/types/AxisLayerConfig';
import { getChartInnerDimensions } from '@/page-layout/widgets/graph/chart-core/utils/getChartInnerDimensions';
import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graph-widget-bar-chart/constants/BarChartConstants';
import { type BarChartDatum } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarChartDatum';
import { getBarChartInnerPadding } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/getBarChartInnerPadding';
import { getBarChartLayout } from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/getBarChartLayout';
import { type ChartAxisTheme } from '@/page-layout/widgets/graph/types/ChartAxisTheme';
import { type GraphValueFormatOptions } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { resolveAxisFontSizes } from '@/page-layout/widgets/graph/utils/resolveAxisFontSizes';
import { useMemo } from 'react';
import { BarChartLayout } from '~/generated-metadata/graphql';

type UseBarChartLayoutParams = {
  axisTheme: ChartAxisTheme;
  axisConfig?: {
    xAxisLabel?: string;
    yAxisLabel?: string;
  };
  chartHeight: number;
  chartWidth: number;
  data: BarChartDatum[];
  effectiveValueRange: { minimum: number; maximum: number };
  hasExplicitRangeBounds: boolean;
  formatOptions: GraphValueFormatOptions;
  groupMode: 'grouped' | 'stacked';
  indexBy: string;
  keys: string[];
  layout: BarChartLayout;
  rightTickLabels?: string[];
};

type UseBarChartLayoutResult = {
  axisBottomConfiguration: ReturnType<
    typeof getBarChartLayout
  >['axisBottomConfiguration'];
  axisLayerConfig: AxisLayerConfig;
  categoryValues: string[];
  innerHeight: number;
  innerPadding: number;
  innerWidth: number;
  margins: ReturnType<typeof getBarChartLayout>['margins'];
  resolvedCategoryTickValues: (string | number)[];
  formatBottomTick: (value: string | number) => string;
  formatLeftTick: (value: string | number) => string;
  valueDomain: ReturnType<typeof getBarChartLayout>['valueDomain'];
  valueTickValues: ReturnType<typeof getBarChartLayout>['valueTickValues'];
};

export const useBarChartLayout = ({
  axisTheme,
  axisConfig,
  chartHeight,
  chartWidth,
  data,
  effectiveValueRange,
  hasExplicitRangeBounds,
  formatOptions,
  groupMode,
  indexBy,
  keys,
  layout,
  rightTickLabels,
}: UseBarChartLayoutParams): UseBarChartLayoutResult => {
  const { tickFontSize, legendFontSize } = resolveAxisFontSizes(axisTheme);

  const {
    margins,
    axisBottomConfiguration,
    axisLeftConfiguration,
    valueTickValues,
    valueDomain,
  } = getBarChartLayout({
    axisTheme,
    chartHeight,
    chartWidth,
    data,
    effectiveMaximumValue: effectiveValueRange.maximum,
    effectiveMinimumValue: effectiveValueRange.minimum,
    hasExplicitRangeBounds,
    formatOptions,
    indexBy,
    layout,
    rightTickLabels,
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

  const { innerWidth, innerHeight } = getChartInnerDimensions({
    chartWidth,
    chartHeight,
    margins,
  });

  const categoryValues = useMemo(
    () => data.map((item) => String(item[indexBy] ?? '')),
    [data, indexBy],
  );

  const categoryTickValues =
    layout === BarChartLayout.VERTICAL
      ? axisBottomConfiguration.tickValues
      : axisLeftConfiguration.tickValues;

  const resolvedCategoryTickValues = useMemo(
    () =>
      Array.isArray(categoryTickValues) ? categoryTickValues : categoryValues,
    [categoryTickValues, categoryValues],
  );

  const isVerticalLayout = layout === BarChartLayout.VERTICAL;

  const formatBottomTick = (value: string | number): string => {
    const formattedValue = axisBottomConfiguration.format?.(
      isVerticalLayout ? value : Number(value),
    );
    return String(formattedValue ?? value);
  };

  const formatLeftTick = (value: string | number): string => {
    const formattedValue = axisLeftConfiguration.format?.(
      isVerticalLayout ? Number(value) : value,
    );
    return String(formattedValue ?? value);
  };

  const axisLayerConfig: AxisLayerConfig = {
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

  return {
    axisBottomConfiguration,
    axisLayerConfig,
    categoryValues,
    innerHeight,
    innerPadding,
    innerWidth,
    margins,
    resolvedCategoryTickValues,
    formatBottomTick,
    formatLeftTick,
    valueDomain,
    valueTickValues,
  };
};
