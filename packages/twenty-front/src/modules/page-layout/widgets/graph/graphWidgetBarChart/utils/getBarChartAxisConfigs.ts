import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { getBarChartMargins } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartMargins';
import { getBarChartTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getBarChartTickValues';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

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
  const { categoryTickValues, numberOfValueTicks, maxBottomTickLabelLength } =
    getBarChartTickValues({
      width,
      height,
      data,
      indexBy,
      xAxisLabel,
      yAxisLabel,
      axisFontSize,
      layout,
    });

  const margins = getBarChartMargins({ xAxisLabel, yAxisLabel, layout });

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
          truncateTickLabel(String(value), maxBottomTickLabelLength),
      },
      axisLeft: {
        tickSize: 0,
        tickPadding: TICK_PADDING,
        tickRotation: 0,
        tickValues: numberOfValueTicks,
        legend: yAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: -margins.left + LEFT_AXIS_LEGEND_OFFSET_PADDING,
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
      format: (value: number) =>
        truncateTickLabel(
          formatGraphValue(value, formatOptions ?? {}),
          maxBottomTickLabelLength,
        ),
    },
    axisLeft: {
      tickSize: 0,
      tickPadding: TICK_PADDING,
      tickRotation: 0,
      tickValues: categoryTickValues,
      legend: xAxisLabel,
      legendPosition: 'middle' as const,
      legendOffset: -margins.left + LEFT_AXIS_LEGEND_OFFSET_PADDING,
      format: (value: string | number) =>
        truncateTickLabel(String(value), MAX_LEFT_AXIS_LABEL_LENGTH),
    },
  };
};
