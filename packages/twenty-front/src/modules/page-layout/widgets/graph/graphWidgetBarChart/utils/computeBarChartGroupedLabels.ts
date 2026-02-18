import { type BarChartLabelData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLabelData';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';

export const computeBarChartGroupedLabels = (
  bars: BarPosition[],
): BarChartLabelData[] => {
  return bars.map((bar) => {
    const value = bar.value;
    const shouldRenderBelow = value < 0;
    const centerX = bar.x + bar.width / 2;
    const centerY = bar.y + bar.height / 2;

    return {
      key: `value-${bar.seriesId}-${bar.indexValue}`,
      value,
      verticalX: centerX,
      verticalY: shouldRenderBelow ? bar.y + bar.height : bar.y,
      horizontalX: shouldRenderBelow ? bar.x : bar.x + bar.width,
      horizontalY: centerY,
      shouldRenderBelow,
    };
  });
};
