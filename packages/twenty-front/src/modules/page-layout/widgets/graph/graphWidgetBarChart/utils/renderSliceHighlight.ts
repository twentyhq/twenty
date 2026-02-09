import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';

export const renderSliceHighlight = ({
  ctx,
  slice,
  innerWidth,
  innerHeight,
  isVertical,
  highlightColor,
}: {
  ctx: CanvasRenderingContext2D;
  slice: BarChartSlice;
  innerWidth: number;
  innerHeight: number;
  isVertical: boolean;
  highlightColor: string;
}): void => {
  const halfThickness = BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS / 2;
  const center = slice.sliceCenter;

  ctx.fillStyle = highlightColor;

  if (isVertical) {
    ctx.fillRect(
      center - halfThickness,
      0,
      BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS,
      innerHeight,
    );
  } else {
    ctx.fillRect(
      0,
      center - halfThickness,
      innerWidth,
      BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS,
    );
  }
};
