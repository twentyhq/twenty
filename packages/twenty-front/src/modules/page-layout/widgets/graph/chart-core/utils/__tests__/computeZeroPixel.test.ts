import { computeZeroPixel } from '@/page-layout/widgets/graph/chart-core/utils/computeZeroPixel';

describe('computeZeroPixel', () => {
  it('returns the midpoint when zero is centered in the domain', () => {
    const zeroPixel = computeZeroPixel({
      domain: { min: -10, max: 10 },
      axisLength: 100,
    });

    expect(zeroPixel).toBe(50);
  });

  it('clamps below-domain zero to the start of the axis', () => {
    const zeroPixel = computeZeroPixel({
      domain: { min: 10, max: 20 },
      axisLength: 100,
    });

    expect(zeroPixel).toBe(0);
  });

  it('clamps above-domain zero to the end of the axis', () => {
    const zeroPixel = computeZeroPixel({
      domain: { min: -20, max: -10 },
      axisLength: 100,
    });

    expect(zeroPixel).toBe(100);
  });

  it('returns 0 when the domain range is zero', () => {
    const zeroPixel = computeZeroPixel({
      domain: { min: 5, max: 5 },
      axisLength: 100,
    });

    expect(zeroPixel).toBe(0);
  });
});
