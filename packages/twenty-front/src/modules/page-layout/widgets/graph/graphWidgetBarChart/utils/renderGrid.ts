import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';

export const renderGrid = ({
  ctx,
  innerWidth,
  innerHeight,
  valueTickValues,
  valueDomain,
  isVertical,
  gridColor,
}: {
  ctx: CanvasRenderingContext2D;
  innerWidth: number;
  innerHeight: number;
  valueTickValues: number[];
  valueDomain: { min: number; max: number };
  isVertical: boolean;
  gridColor: string;
}): void => {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = BAR_CHART_CONSTANTS.GRID_LINE_WIDTH;
  ctx.setLineDash([
    BAR_CHART_CONSTANTS.GRID_DASH_LENGTH,
    BAR_CHART_CONSTANTS.GRID_DASH_GAP,
  ]);

  const range = valueDomain.max - valueDomain.min;
  if (range === 0) {
    ctx.setLineDash([]);
    return;
  }

  for (const tickValue of valueTickValues) {
    const normalizedPosition = (tickValue - valueDomain.min) / range;

    ctx.beginPath();
    if (isVertical) {
      const y = innerHeight * (1 - normalizedPosition);
      ctx.moveTo(0, y);
      ctx.lineTo(innerWidth, y);
    } else {
      const x = innerWidth * normalizedPosition;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, innerHeight);
    }
    ctx.stroke();
  }

  ctx.setLineDash([]);
};
