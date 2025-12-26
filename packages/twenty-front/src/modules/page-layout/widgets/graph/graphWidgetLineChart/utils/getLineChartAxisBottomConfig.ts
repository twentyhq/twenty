import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { computeLineChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartCategoryTickValues';
import { getTickRotationConfig } from '@/page-layout/widgets/graph/utils/getTickRotationConfig';
import { isNonEmptyArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export type LineChartAxisBottomResult = {
  config: {
    tickSize: number;
    tickPadding: number;
    tickRotation: number;
    tickValues: (string | number)[] | undefined;
    legend: string | undefined;
    legendPosition: 'middle';
    legendOffset: number;
    format: (value: string | number) => string;
  };
  marginBottom: number;
};

export const getLineChartAxisBottomConfig = (
  xAxisLabel?: string,
  width?: number,
  data?: LineChartSeries[],
  marginLeft?: number,
): LineChartAxisBottomResult => {
  const effectiveMarginLeft =
    marginLeft ?? COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITH_LABEL;

  const tickValues =
    width && data
      ? computeLineChartCategoryTickValues({
          width,
          data,
          marginLeft: effectiveMarginLeft,
          marginRight: COMMON_CHART_CONSTANTS.MARGIN_RIGHT,
        })
      : undefined;

  const availableWidth = width
    ? width - (effectiveMarginLeft + COMMON_CHART_CONSTANTS.MARGIN_RIGHT)
    : 0;

  const actualDataPointCount = isNonEmptyArray(data?.[0]?.data)
    ? data[0].data.length
    : 1;

  const widthPerDataPoint =
    actualDataPointCount > 0 && availableWidth > 0
      ? availableWidth / actualDataPointCount
      : 0;

  const { tickRotation, maxLabelLength } = getTickRotationConfig({
    widthPerTick: widthPerDataPoint,
    axisFontSize: COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE,
  });

  const hasRotation = tickRotation !== 0;
  const baseMarginBottom = isDefined(xAxisLabel)
    ? COMMON_CHART_CONSTANTS.MARGIN_BOTTOM_WITH_LABEL
    : COMMON_CHART_CONSTANTS.MARGIN_BOTTOM_WITHOUT_LABEL;
  const marginBottom = hasRotation
    ? baseMarginBottom +
      COMMON_CHART_CONSTANTS.ROTATED_LABELS_EXTRA_BOTTOM_MARGIN
    : baseMarginBottom;

  return {
    config: {
      tickSize: COMMON_CHART_CONSTANTS.TICK_SIZE,
      tickPadding: COMMON_CHART_CONSTANTS.TICK_PADDING,
      tickRotation,
      tickValues,
      legend: xAxisLabel,
      legendPosition: 'middle' as const,
      legendOffset:
        COMMON_CHART_CONSTANTS.BOTTOM_AXIS_LEGEND_OFFSET +
        (hasRotation
          ? COMMON_CHART_CONSTANTS.ROTATED_LABELS_EXTRA_BOTTOM_MARGIN
          : 0),
      format: (value: string | number) =>
        truncateTickLabel(String(value), maxLabelLength),
    },
    marginBottom,
  };
};
