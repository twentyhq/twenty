import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { computeBarChartBottomTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartBottomTickValues';
import { truncateTickLabel } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/truncateTickLabel';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

const AVERAGE_CHARACTER_WIDTH_RATIO = 0.6;
const MIN_TICK_LABEL_LENGTH = 5;
const MAX_LEFT_AXIS_LABEL_LENGTH = 20;

type GetBarChartAxisConfigsProps = {
  width: number;
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
  data,
  layout,
  indexBy,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  axisFontSize = 11,
}: GetBarChartAxisConfigsProps) => {
  const tickValues = computeBarChartBottomTickValues({
    width,
    data,
    layout,
    indexBy,
  });

  const verticalLayoutMargin = 90;
  const availableWidth = width - verticalLayoutMargin;
  const widthPerTick =
    tickValues.length > 0 ? availableWidth / tickValues.length : 0;
  const averageCharacterWidth = axisFontSize * AVERAGE_CHARACTER_WIDTH_RATIO;
  const maxLabelLength = Math.max(
    MIN_TICK_LABEL_LENGTH,
    Math.floor(widthPerTick / averageCharacterWidth),
  );

  if (layout === 'vertical') {
    return {
      axisBottom: {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        tickValues,
        legend: xAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: 40,
        format: (value: string | number) =>
          truncateTickLabel(String(value), maxLabelLength),
      },
      axisLeft: {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: yAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: -50,
        format: (value: number) => formatGraphValue(value, formatOptions || {}),
      },
    };
  }

  return {
    axisBottom: {
      tickSize: 0,
      tickPadding: 5,
      tickRotation: 0,
      tickValues,
      legend: yAxisLabel,
      legendPosition: 'middle' as const,
      legendOffset: 40,
      format: (value: number) => formatGraphValue(value, formatOptions || {}),
    },
    axisLeft: {
      tickSize: 0,
      tickPadding: 5,
      tickRotation: 0,
      legend: xAxisLabel,
      legendPosition: 'middle' as const,
      legendOffset: -50,
      format: (value: string | number) =>
        truncateTickLabel(value, MAX_LEFT_AXIS_LABEL_LENGTH),
    },
  };
};
