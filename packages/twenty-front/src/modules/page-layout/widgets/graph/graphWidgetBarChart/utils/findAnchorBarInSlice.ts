import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';

export const findAnchorBarInSlice = ({
  bars,
  isVerticalLayout,
}: {
  bars: BarPosition[];
  isVerticalLayout: boolean;
}): BarPosition => {
  if (bars.length === 0) {
    throw new Error('Cannot find anchor bar in empty slice');
  }

  return bars.reduce((anchor, bar) => {
    if (isVerticalLayout) {
      return bar.y < anchor.y ? bar : anchor;
    }
    return bar.x + bar.width > anchor.x + anchor.width ? bar : anchor;
  });
};
