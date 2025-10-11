import { BAR_CHART_MARGINS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMargins';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';

const MINIMUM_WIDTH_PER_TICK = 100;

export const computeBarChartCategoryTickValues = ({
  width,
  data,
  indexBy,
}: {
  width: number;
  data: BarChartDataItem[];
  indexBy: string;
}): (string | number)[] => {
  if (width === 0 || data.length === 0) return [];

  const horizontalMargins = BAR_CHART_MARGINS.left + BAR_CHART_MARGINS.right;
  const availableWidth = width - horizontalMargins;
  const numberOfTicks = Math.floor(availableWidth / MINIMUM_WIDTH_PER_TICK);

  if (numberOfTicks <= 0) return [];
  if (numberOfTicks === 1) return [data[0][indexBy] as string | number];
  if (numberOfTicks >= data.length)
    return data.map((item) => item[indexBy] as string | number);

  const step = (data.length - 1) / (numberOfTicks - 1);

  return Array.from({ length: numberOfTicks }, (_, i) => {
    const index = Math.min(Math.round(i * step), data.length - 1);
    return data[index][indexBy] as string | number;
  });
};
