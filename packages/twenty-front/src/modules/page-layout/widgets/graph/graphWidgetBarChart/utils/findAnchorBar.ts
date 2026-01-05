import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { BarChartLayout } from '~/generated/graphql';

export const findAnchorBar = (
  bars: BarChartSlice['bars'],
  layout: BarChartLayout,
  groupMode: 'grouped' | 'stacked',
) => {
  if (groupMode === 'grouped') {
    return bars[0];
  }

  const isVertical = layout === BarChartLayout.VERTICAL;

  return bars.reduce((anchor, bar) => {
    if (isVertical) {
      return bar.y < anchor.y ? bar : anchor;
    }
    return bar.x + bar.width > anchor.x + anchor.width ? bar : anchor;
  }, bars[0]);
};
