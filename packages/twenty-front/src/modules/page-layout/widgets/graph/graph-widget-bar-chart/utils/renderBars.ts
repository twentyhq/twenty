import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graph-widget-bar-chart/constants/BarChartConstants';
import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity';
import { type BarPosition } from '@/page-layout/widgets/graph/graph-widget-bar-chart/types/BarPosition';
import {
  drawHorizontalRoundedRect,
  drawRoundedRect,
} from '@/page-layout/widgets/graph/graph-widget-bar-chart/utils/drawRoundedRect';

export const renderBars = ({
  ctx,
  bars,
  borderRadius,
  isVertical,
  highlightedLegendId,
}: {
  ctx: CanvasRenderingContext2D;
  bars: BarPosition[];
  borderRadius: number;
  isVertical: boolean;
  highlightedLegendId: string | null;
}): void => {
  for (const bar of bars) {
    const isDimmed =
      highlightedLegendId !== null && bar.seriesId !== highlightedLegendId;

    ctx.globalAlpha = isDimmed ? LEGEND_HIGHLIGHT_DIMMED_OPACITY : 1;
    ctx.fillStyle = bar.color;

    const isNegative = bar.value < 0;

    const segmentSize = isVertical ? bar.height : bar.width;
    const segmentGap = bar.shouldRoundFreeEnd
      ? 0
      : Math.min(
          BAR_CHART_CONSTANTS.STACKED_SEGMENT_GAP,
          Math.max(
            0,
            segmentSize - BAR_CHART_CONSTANTS.MINIMUM_VISIBLE_SEGMENT_SIZE,
          ),
        );

    if (isVertical) {
      const roundTop = bar.shouldRoundFreeEnd && !isNegative;
      const roundBottom = bar.shouldRoundFreeEnd && isNegative;

      drawRoundedRect({
        ctx,
        x: bar.x,
        y: isNegative ? bar.y : bar.y + segmentGap,
        width: bar.width,
        height: Math.max(0, bar.height - segmentGap),
        radius: borderRadius,
        roundTop,
        roundBottom,
      });
    } else {
      const roundRight = bar.shouldRoundFreeEnd && !isNegative;
      const roundLeft = bar.shouldRoundFreeEnd && isNegative;

      drawHorizontalRoundedRect({
        ctx,
        x: isNegative ? bar.x + segmentGap : bar.x,
        y: bar.y,
        width: Math.max(0, bar.width - segmentGap),
        height: bar.height,
        radius: borderRadius,
        roundLeft,
        roundRight,
      });
    }
  }

  ctx.globalAlpha = 1;
};
