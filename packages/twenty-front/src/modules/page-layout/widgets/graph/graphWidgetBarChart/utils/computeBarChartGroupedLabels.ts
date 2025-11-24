import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
import { type BarChartLabelData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLabelData';
import { type ComputedBarDatum } from '@nivo/bar';

export const computeBarChartGroupedLabels = (
  bars: readonly ComputedBarDatum<BarChartDataItem>[],
): BarChartLabelData[] => {
  return bars.map((bar) => {
    const value = Number(bar.data.value);
    const shouldRenderBelow = value < 0;
    const centerX = bar.x + bar.width / 2;
    const centerY = bar.y + bar.height / 2;

    return {
      key: `value-${bar.data.id}-${bar.data.indexValue}`,
      value,
      verticalX: centerX,
      verticalY: shouldRenderBelow ? bar.y + bar.height : bar.y,
      horizontalX: shouldRenderBelow ? bar.x : bar.x + bar.width,
      horizontalY: centerY,
      shouldRenderBelow,
    };
  });
};
