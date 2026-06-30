type RoundedRectOptions = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  roundTop: boolean;
  roundBottom: boolean;
};

export const drawRoundedRect = ({
  ctx,
  x,
  y,
  width,
  height,
  radius,
  roundTop,
  roundBottom,
}: RoundedRectOptions): void => {
  if (width <= 0 || height <= 0) {
    return;
  }

  const effectiveRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();

  if (roundTop && roundBottom) {
    ctx.roundRect(x, y, width, height, effectiveRadius);
  } else if (roundTop) {
    ctx.roundRect(x, y, width, height, [
      effectiveRadius,
      effectiveRadius,
      0,
      0,
    ]);
  } else if (roundBottom) {
    ctx.roundRect(x, y, width, height, [
      0,
      0,
      effectiveRadius,
      effectiveRadius,
    ]);
  } else {
    ctx.rect(x, y, width, height);
  }

  ctx.fill();
};

type HorizontalRoundedRectOptions = {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  roundLeft: boolean;
  roundRight: boolean;
};

export const drawHorizontalRoundedRect = ({
  ctx,
  x,
  y,
  width,
  height,
  radius,
  roundLeft,
  roundRight,
}: HorizontalRoundedRectOptions): void => {
  if (width <= 0 || height <= 0) {
    return;
  }

  const effectiveRadius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();

  if (roundLeft && roundRight) {
    ctx.roundRect(x, y, width, height, effectiveRadius);
  } else if (roundRight) {
    ctx.roundRect(x, y, width, height, [
      0,
      effectiveRadius,
      effectiveRadius,
      0,
    ]);
  } else if (roundLeft) {
    ctx.roundRect(x, y, width, height, [
      effectiveRadius,
      0,
      0,
      effectiveRadius,
    ]);
  } else {
    ctx.rect(x, y, width, height);
  }

  ctx.fill();
};
