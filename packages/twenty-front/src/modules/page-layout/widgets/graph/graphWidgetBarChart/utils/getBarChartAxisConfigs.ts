import { BAR_CHART_MARGINS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMargins';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { computeBarChartCategoryTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartCategoryTickValues';
import { computeBarChartValueTickCount } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartValueTickCount';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

const AVERAGE_CHARACTER_WIDTH_RATIO = 0.6;
const MIN_TICK_LABEL_LENGTH = 5;
const MAX_LEFT_AXIS_LABEL_LENGTH = 10;
const LEFT_AXIS_LEGEND_OFFSET_PADDING = 5;
const TICK_PADDING = 5;
const BOTTOM_AXIS_LEGEND_OFFSET = 40;

type GetBarChartAxisConfigsProps = {
  width: number;
  height: number;
  data: BarChartDataItem[];
  layout: 'vertical' | 'horizontal';
  indexBy: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatOptions?: GraphValueFormatOptions;
  axisFontSize?: number;
};

export const getBarChartAxisConfigs = ({
  width,
  height,
  data,
  layout,
  indexBy,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  axisFontSize = 11,
}: GetBarChartAxisConfigsProps) => {
  const categoryTickValues = computeBarChartCategoryTickValues({
    width,
    data,
    indexBy,
  });

  const availableWidth =
    width - (BAR_CHART_MARGINS.left + BAR_CHART_MARGINS.right);
  const availableHeight =
    height - (BAR_CHART_MARGINS.top + BAR_CHART_MARGINS.bottom);
  const widthPerTick =
    categoryTickValues.length > 0
      ? availableWidth / categoryTickValues.length
      : 0;
  const averageCharacterWidth = axisFontSize * AVERAGE_CHARACTER_WIDTH_RATIO;
  const maxLabelLength = Math.max(
    MIN_TICK_LABEL_LENGTH,
    Math.floor(widthPerTick / averageCharacterWidth),
  );

  const numberOfValueTicks = computeBarChartValueTickCount({
    height: availableHeight,
    axisFontSize,
  });

  if (layout === 'vertical') {
    return {
      axisBottom: {
        tickSize: 0,
        tickPadding: TICK_PADDING,
        tickRotation: 0,
        tickValues: categoryTickValues,
        legend: xAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: BOTTOM_AXIS_LEGEND_OFFSET,
        format: (value: string | number) =>
          truncateTickLabel(String(value), maxLabelLength),
      },
      axisLeft: {
        tickSize: 0,
        tickPadding: TICK_PADDING,
        tickRotation: 0,
        tickValues: numberOfValueTicks,
        legend: yAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: -BAR_CHART_MARGINS.left + LEFT_AXIS_LEGEND_OFFSET_PADDING,
        format: (value: number) =>
          truncateTickLabel(
            formatGraphValue(value, formatOptions ?? {}),
            MAX_LEFT_AXIS_LABEL_LENGTH,
          ),
      },
    };
  }

  return {
    axisBottom: {
      tickSize: 0,
      tickPadding: TICK_PADDING,
      tickRotation: 0,
      tickValues: numberOfValueTicks,
      legend: yAxisLabel,
      legendPosition: 'middle' as const,
      legendOffset: BOTTOM_AXIS_LEGEND_OFFSET,
      format: (value: number) => formatGraphValue(value, formatOptions || {}),
    },
    axisLeft: {
      tickSize: 0,
      tickPadding: TICK_PADDING,
      tickRotation: 0,
      tickValues: categoryTickValues,
      legend: xAxisLabel,
      legendPosition: 'middle' as const,
      legendOffset: -BAR_CHART_MARGINS.left + LEFT_AXIS_LEGEND_OFFSET_PADDING,
      format: (value: string | number) =>
        truncateTickLabel(String(value), MAX_LEFT_AXIS_LABEL_LENGTH),
    },
  };
};
