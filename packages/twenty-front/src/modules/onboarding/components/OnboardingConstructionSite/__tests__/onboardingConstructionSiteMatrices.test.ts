import {
  createLookAtMatrix,
  createPerspectiveMatrix,
  multiplyMatrices,
  writeTransformMatrix,
} from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteMatrices';

const transformPoint = (matrix: Float32Array, point: readonly number[]) => {
  const [x, y, z] = point;
  const w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
  return [
    (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w,
    (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w,
    (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w,
  ];
};

describe('onboardingConstructionSiteMatrices', () => {
  it('should scale then translate an instance', () => {
    const matrix = new Float32Array(16);
    writeTransformMatrix(matrix, 0, [1, 2, 3], [0, 0, 0], [2, 3, 4]);

    expect(transformPoint(matrix, [0.5, 0.5, 0.5])).toEqual([2, 3.5, 5]);
  });

  it('should turn the unit x axis into the yaw direction', () => {
    const matrix = new Float32Array(16);
    writeTransformMatrix(matrix, 0, [0, 0, 0], [0, Math.PI / 2, 0], [1, 1, 1]);

    const [x, y, z] = transformPoint(matrix, [1, 0, 0]);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
    expect(z).toBeCloseTo(-1);
  });

  it('should project the look-at target to the center of the screen', () => {
    const viewProjection = multiplyMatrices(
      createPerspectiveMatrix(Math.PI / 4, 1.6, 0.1, 60),
      createLookAtMatrix([0, 1, 10], [0, 0, 0]),
    );

    const [x, y, depth] = transformPoint(viewProjection, [0, 0, 0]);
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
    expect(depth).toBeGreaterThan(-1);
    expect(depth).toBeLessThan(1);
  });

  it('should shift the image vertically without tilting the view', () => {
    const viewProjection = multiplyMatrices(
      createPerspectiveMatrix(Math.PI / 4, 1.6, 0.1, 60, -0.4),
      createLookAtMatrix([0, -1, 10], [0, -1, 0]),
    );

    const [, bottomY] = transformPoint(viewProjection, [0, -2, 0]);
    const [, topY] = transformPoint(viewProjection, [0, 2, 0]);
    const [, eyeLevelY] = transformPoint(viewProjection, [3, -1, -5]);
    expect(eyeLevelY).toBeCloseTo(-0.4);
    expect(topY - bottomY).toBeCloseTo(4 / (10 * Math.tan(Math.PI / 8)));
  });
});
