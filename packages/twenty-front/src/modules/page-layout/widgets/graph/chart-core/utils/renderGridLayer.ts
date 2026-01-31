type RenderGridLayerParams = {
  ctx: CanvasRenderingContext2D;
  innerWidth: number;
  innerHeight: number;
  valueTickValues: number[];
  valueDomain: { min: number; max: number };
  isVertical: boolean;
  gridColor: string;
  lineWidth: number;
  dashLength: number;
  dashGap: number;
};

export const renderGridLayer = ({
  ctx,
  innerWidth,
  innerHeight,
  valueTickValues,
  valueDomain,
  isVertical,
  gridColor,
  lineWidth,
  dashLength,
  dashGap,
}: RenderGridLayerParams): void => {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([dashLength, dashGap]);

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
