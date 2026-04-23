export const calculateGaugeChartEndLineCoordinates = (
  endAngle: number,
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
) => {
  const adjustedAngle = endAngle - Math.PI / 2;

  const x1 = centerX + Math.cos(adjustedAngle) * innerRadius;
  const y1 = centerY + Math.sin(adjustedAngle) * innerRadius;
  const x2 = centerX + Math.cos(adjustedAngle) * outerRadius;
  const y2 = centerY + Math.sin(adjustedAngle) * outerRadius;

  return { x1, y1, x2, y2 };
};
