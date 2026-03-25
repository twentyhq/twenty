import { computeValueScale } from '@/page-layout/widgets/graph/chart-core/utils/computeValueScale';

describe('computeValueScale', () => {
  it('maps domain bounds to axis bounds', () => {
    const { valueToPixel } = computeValueScale({
      domain: { min: 10, max: 20 },
      axisLength: 100,
    });

    expect(valueToPixel(10)).toBe(0);
    expect(valueToPixel(15)).toBe(50);
    expect(valueToPixel(20)).toBe(100);
  });

  it('clamps values below the domain to 0', () => {
    const { valueToPixel } = computeValueScale({
      domain: { min: 10, max: 20 },
      axisLength: 100,
    });

    expect(valueToPixel(0)).toBe(0);
  });

  it('clamps values above the domain to axisLength', () => {
    const { valueToPixel } = computeValueScale({
      domain: { min: -20, max: -10 },
      axisLength: 100,
    });

    expect(valueToPixel(0)).toBe(100);
  });

  it('returns 0 when the domain range is zero', () => {
    const { valueToPixel } = computeValueScale({
      domain: { min: 5, max: 5 },
      axisLength: 100,
    });

    expect(valueToPixel(5)).toBe(0);
  });
});
