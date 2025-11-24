import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { type ComputedBarDatum } from '@nivo/bar';

export const calculateBarChartEndLineCoordinates = (
  bar: ComputedBarDatum<BarChartDataItem>,
  layout: BarChartLayout,
) => {
  if (layout === BarChartLayout.VERTICAL) {
    return {
      x1: bar.x,
      x2: bar.x + bar.width,
      y1: bar.y,
      y2: bar.y,
    };
  }
  return {
    x1: bar.x + bar.width,
    x2: bar.x + bar.width,
    y1: bar.y,
    y2: bar.y + bar.height,
  };
};
