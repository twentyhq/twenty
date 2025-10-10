import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';

const VERTICAL_LAYOUT_MARGIN = 90;
const HORIZONTAL_LAYOUT_MARGIN = 140;
const MINIMUM_WIDTH_PER_TICK = 100;

export const computeBarChartBottomTickValues = ({
  width,
  data,
  layout,
  indexBy,
}: {
  width: number;
  data: BarChartDataItem[];
  layout: 'vertical' | 'horizontal';
  indexBy: string;
}): (string | number)[] => {
  if (width === 0 || data.length === 0) return [];

  const availableWidth =
    layout === 'vertical'
      ? width - VERTICAL_LAYOUT_MARGIN
      : width - HORIZONTAL_LAYOUT_MARGIN;
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
