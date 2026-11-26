type RenderGridLayerParams = {
  ctx: CanvasRenderingContext2D;
  innerWidth: number;
  innerHeight: number;
  valueTickValues: number[];
  valueDomain: { min: number; max: number };
  isVertical: boolean;
  gridColor: string;
  lineWidth: number;
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
}: RenderGridLayerParams): void => {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = lineWidth;

  const range = valueDomain.max - valueDomain.min;
  if (range === 0) {
    return;
  }

  for (const tickValue of valueTickValues) {
    const normalizedPosition = (tickValue - valueDomain.min) / range;

    if (normalizedPosition <= 0 || normalizedPosition >= 1) {
      continue;
    }

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
};
