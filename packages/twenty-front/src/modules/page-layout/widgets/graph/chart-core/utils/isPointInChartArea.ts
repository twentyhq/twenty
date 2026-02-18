export const isPointInChartArea = ({
  x,
  y,
  innerWidth,
  innerHeight,
}: {
  x: number;
  y: number;
  innerWidth: number;
  innerHeight: number;
}): boolean => {
  return x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
};
