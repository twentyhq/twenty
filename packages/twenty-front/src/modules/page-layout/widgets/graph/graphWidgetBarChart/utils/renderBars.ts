import { LEGEND_HIGHLIGHT_DIMMED_OPACITY } from '@/page-layout/widgets/graph/constants/LegendHighlightDimmedOpacity.constant';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import {
  drawHorizontalRoundedRect,
  drawRoundedRect,
} from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/drawRoundedRect';

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

    if (isVertical) {
      const roundTop = bar.shouldRoundFreeEnd && !isNegative;
      const roundBottom = bar.shouldRoundFreeEnd && isNegative;

      drawRoundedRect({
        ctx,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        radius: borderRadius,
        roundTop,
        roundBottom,
      });
    } else {
      const roundRight = bar.shouldRoundFreeEnd && !isNegative;
      const roundLeft = bar.shouldRoundFreeEnd && isNegative;

      drawHorizontalRoundedRect({
        ctx,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        radius: borderRadius,
        roundLeft,
        roundRight,
      });
    }
  }

  ctx.globalAlpha = 1;
};
