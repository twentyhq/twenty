export const calculatePieChartAngles = (
  percentage: number,
  cumulativeAngle: number,
) => {
  const sliceAngle = (percentage / 100) * 360;
  const middleAngle = cumulativeAngle + sliceAngle / 2;
  const newCumulativeAngle = cumulativeAngle + sliceAngle;

  return {
    sliceAngle,
    middleAngle,
    newCumulativeAngle,
  };
};
