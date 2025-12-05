import { LINE_CHART_MARGIN_BOTTOM } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginBottom';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { computeLineChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartCategoryTickValues';
import { ELLIPSIS_LENGTH } from '@/page-layout/widgets/graph/utils/ellipsisLength';
import { getTickRotationConfig } from '@/page-layout/widgets/graph/utils/getTickRotationConfig';
import { MIN_DISPLAY_CHARS } from '@/page-layout/widgets/graph/utils/minDisplayChars';
import { MIN_LABEL_LENGTH_FOR_TRUNCATION } from '@/page-layout/widgets/graph/utils/minLabelLengthForTruncation';

const LINE_CHART_MARGIN_LEFT = 70;
const LINE_CHART_MARGIN_RIGHT = 20;
const LINE_CHART_AXIS_FONT_SIZE = 11;
const ROTATED_LABELS_EXTRA_BOTTOM_MARGIN = 20;
const LINE_CHART_TICK_SIZE = 0;
const LINE_CHART_TICK_PADDING = 5;
const LINE_CHART_LEGEND_OFFSET_BASE = 40;
const FALLBACK_DATA_POINT_COUNT = 1;
const FALLBACK_WIDTH = 0;

const truncateTickLabel = (value: string, maxLength: number): string => {
  if (
    maxLength < MIN_LABEL_LENGTH_FOR_TRUNCATION ||
    value.length <= maxLength
  ) {
    return value;
  }

  const charsToShow = Math.max(MIN_DISPLAY_CHARS, maxLength - ELLIPSIS_LENGTH);
  return `${value.slice(0, charsToShow)}...`;
};

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
): LineChartAxisBottomResult => {
  const tickValues =
    width && data
      ? computeLineChartCategoryTickValues({ width, data })
      : undefined;

  // Calculate available width per tick for rotation decision
  const availableWidth = width
    ? width - (LINE_CHART_MARGIN_LEFT + LINE_CHART_MARGIN_RIGHT)
    : 0;

  // For rotation decision, we need to consider the actual number of data points,
  // not just the filtered tick values, because each data point takes space
  const actualDataPointCount =
    data && data.length > 0 && data[0].data.length > 0
      ? data[0].data.length
      : FALLBACK_DATA_POINT_COUNT;
  const widthPerDataPoint =
    actualDataPointCount > 0 && availableWidth > 0
      ? availableWidth / actualDataPointCount
      : FALLBACK_WIDTH;

  const { tickRotation, maxLabelLength } = getTickRotationConfig({
    widthPerTick: widthPerDataPoint,
    axisFontSize: LINE_CHART_AXIS_FONT_SIZE,
  });

  const hasRotation = tickRotation !== 0;
  const marginBottom = hasRotation
    ? LINE_CHART_MARGIN_BOTTOM + ROTATED_LABELS_EXTRA_BOTTOM_MARGIN
    : LINE_CHART_MARGIN_BOTTOM;

  return {
    config: {
      tickSize: LINE_CHART_TICK_SIZE,
      tickPadding: LINE_CHART_TICK_PADDING,
      tickRotation,
      tickValues,
      legend: xAxisLabel,
      legendPosition: 'middle' as const,
      legendOffset:
        LINE_CHART_LEGEND_OFFSET_BASE +
        (hasRotation ? ROTATED_LABELS_EXTRA_BOTTOM_MARGIN : 0),
      format: (value: string | number) =>
        truncateTickLabel(String(value), maxLabelLength),
    },
    marginBottom,
  };
};
