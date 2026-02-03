import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { findAnchorBarInSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findAnchorBarInSlice';

type ComputeSliceTooltipPositionParams = {
  slice: BarChartSlice;
  margins: ChartMargins;
  innerHeight: number;
  isVertical: boolean;
};

type SliceTooltipPosition = {
  offsetLeft: number;
  offsetTop: number;
};

export const computeSliceTooltipPosition = ({
  slice,
  margins,
  innerHeight,
  isVertical,
}: ComputeSliceTooltipPositionParams): SliceTooltipPosition => {
  if (slice.bars.length === 0) {
    return {
      offsetLeft: isVertical ? slice.sliceCenter + margins.left : margins.left,
      offsetTop: isVertical
        ? innerHeight + margins.top
        : slice.sliceCenter + margins.top,
    };
  }

  const anchorBar = findAnchorBarInSlice({
    bars: slice.bars,
    isVerticalLayout: isVertical,
  });

  return {
    offsetLeft: isVertical
      ? slice.sliceCenter + margins.left
      : anchorBar.x + anchorBar.width + margins.left,
    offsetTop: isVertical
      ? anchorBar.y + margins.top
      : slice.sliceCenter + margins.top,
  };
};
