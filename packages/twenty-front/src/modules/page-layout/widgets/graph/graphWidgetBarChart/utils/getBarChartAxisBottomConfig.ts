import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { computeBarChartBottomTickValues } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBarChartBottomTickValues';
import {
  formatGraphValue,
  type GraphValueFormatOptions,
} from '@/page-layout/widgets/graph/utils/graphFormatters';

const AVERAGE_CHARACTER_WIDTH_RATIO = 0.6;
const MIN_TICK_LABEL_LENGTH = 5;

const truncateTickLabel = (
  value: string | number,
  maxLength: number,
): string => {
  const stringValue = String(value);
  if (stringValue.length <= maxLength) {
    return stringValue;
  }
  return stringValue.slice(0, maxLength - 3) + '...';
};

type GetBarChartAxisBottomConfigProps = {
  width: number;
  data: BarChartDataItem[];
  layout: 'vertical' | 'horizontal';
  indexBy: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  formatOptions?: GraphValueFormatOptions;
  axisFontSize?: number;
};

export const getBarChartAxisBottomConfig = ({
  width,
  data,
  layout,
  indexBy,
  xAxisLabel,
  yAxisLabel,
  formatOptions,
  axisFontSize = 11,
}: GetBarChartAxisBottomConfigProps) => {
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

  return layout === 'vertical'
    ? {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        tickValues,
        legend: xAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: 40,
        format: (value: string | number) =>
          truncateTickLabel(value, maxLabelLength),
      }
    : {
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        tickValues,
        legend: yAxisLabel,
        legendPosition: 'middle' as const,
        legendOffset: 40,
        format: (value: number) => formatGraphValue(value, formatOptions || {}),
      };
};
