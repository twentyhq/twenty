import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import { LINE_CHART_MARGIN_BOTTOM } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartMarginBottom';
import { type LineChartSeries } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeries';
import { computeLineChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartCategoryTickValues';
import { getTickRotationConfig } from '@/page-layout/widgets/graph/utils/getTickRotationConfig';
import { isNonEmptyArray } from '@sniptt/guards';

const LINE_CHART_MARGIN_LEFT = 70;
const LINE_CHART_MARGIN_RIGHT = 20;
const LINE_CHART_AXIS_FONT_SIZE = 11;
const ROTATED_LABELS_EXTRA_BOTTOM_MARGIN = 20;
const LINE_CHART_TICK_SIZE = 0;
const LINE_CHART_TICK_PADDING = 5;
const LINE_CHART_LEGEND_OFFSET_BASE = 40;
const FALLBACK_DATA_POINT_COUNT = 1;
const FALLBACK_WIDTH = 0;

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

  const availableWidth = width
    ? width - (LINE_CHART_MARGIN_LEFT + LINE_CHART_MARGIN_RIGHT)
    : 0;

  const actualDataPointCount = isNonEmptyArray(data?.[0]?.data)
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
