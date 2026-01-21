import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import { type LineChartSeriesWithColor } from '@/page-layout/widgets/graph/graphWidgetLineChart/types/LineChartSeriesWithColor';
import { computeLineChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetLineChart/utils/computeLineChartCategoryTickValues';
import { getTickRotationConfig } from '@/page-layout/widgets/graph/utils/getTickRotationConfig';
import { isNonEmptyArray } from '@sniptt/guards';

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
};

type LineChartAxisBottomConfigParams = {
  xAxisLabel?: string;
  width: number;
  data: LineChartSeriesWithColor[];
  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  axisFontSize: number;
};

export const getLineChartAxisBottomConfig = ({
  xAxisLabel,
  width,
  data,
  marginLeft,
  marginRight,
  marginBottom,
  axisFontSize,
}: LineChartAxisBottomConfigParams): LineChartAxisBottomResult => {
  const tickValues =
    width > 0 && data.length > 0
      ? computeLineChartCategoryTickValues({
          width,
          data,
          marginLeft,
          marginRight,
        })
      : undefined;

  const availableWidth = width - (marginLeft + marginRight);

  const actualDataPointCount = isNonEmptyArray(data?.[0]?.data)
    ? data[0].data.length
    : 1;

  const widthPerDataPoint =
    actualDataPointCount > 0 && availableWidth > 0
      ? availableWidth / actualDataPointCount
      : 0;

  const { tickRotation, maxLabelLength } = getTickRotationConfig({
    widthPerTick: widthPerDataPoint,
    axisFontSize,
    maxLabelHeight: marginBottom,
  });

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
        (tickRotation !== 0
          ? COMMON_CHART_CONSTANTS.ROTATED_LABELS_EXTRA_BOTTOM_MARGIN
          : 0),
      format: (value: string | number) =>
        truncateTickLabel(String(value), maxLabelLength),
    },
  };
};
