export const estimateRotatedLabelHeight = ({
  width,
  height,
  rotationDegrees,
}: {
  width: number;
  height: number;
  rotationDegrees: number;
}): number => {
  if (rotationDegrees === 0 || width === 0) {
    return 0;
  }

  const rotationRadians = (Math.abs(rotationDegrees) * Math.PI) / 180;
  const projectedHeight =
    Math.abs(width * Math.sin(rotationRadians)) +
    Math.abs(height * Math.cos(rotationRadians));

  return Math.max(height, projectedHeight);
};
