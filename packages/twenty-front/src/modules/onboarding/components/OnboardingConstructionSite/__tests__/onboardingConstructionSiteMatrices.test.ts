import {
  createLookAtMatrix,
  createPerspectiveMatrix,
  multiplyMatrices,
  writeTransformMatrix,
} from '@/onboarding/components/OnboardingConstructionSite/onboardingConstructionSiteMatrices';
import { getValueOrThrow } from '@/onboarding/components/OnboardingConstructionSite/__tests__/utils/getValueOrThrow';

const transformPoint = (
  matrix: Float32Array,
  [x, y, z]: readonly [number, number, number],
) => {
  const entry = (index: number) => getValueOrThrow(matrix, index);
  const w = entry(3) * x + entry(7) * y + entry(11) * z + entry(15);
  return [
    (entry(0) * x + entry(4) * y + entry(8) * z + entry(12)) / w,
    (entry(1) * x + entry(5) * y + entry(9) * z + entry(13)) / w,
    (entry(2) * x + entry(6) * y + entry(10) * z + entry(14)) / w,
  ] as const;
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
