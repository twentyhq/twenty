export const calculateAngularGradient = (angle: number) => {
  const gradientAngle = (angle * Math.PI) / 180 + Math.PI / 2;

  const dx = Math.sin(gradientAngle);
  const dy = -Math.cos(gradientAngle);

  return {
    x1: `${50 - dx * 50}%`,
    y1: `${50 - dy * 50}%`,
    x2: `${50 + dx * 50}%`,
    y2: `${50 + dy * 50}%`,
  };
};
