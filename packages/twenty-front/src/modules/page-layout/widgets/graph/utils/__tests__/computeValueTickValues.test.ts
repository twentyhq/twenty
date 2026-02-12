import { computeValueTickValues } from '@/page-layout/widgets/graph/utils/computeValueTickValues';

describe('computeValueTickValues', () => {
  it('should return empty array for non-finite inputs', () => {
    const result = computeValueTickValues({
      minimum: Infinity,
      maximum: 100,
      tickCount: 5,
    });

    expect(result.tickValues).toEqual([]);
    expect(result.domain).toEqual({ min: 0, max: 0 });
  });

  it('should return single tick when min equals max', () => {
    const result = computeValueTickValues({
      minimum: 50,
      maximum: 50,
      tickCount: 5,
    });

    expect(result.tickValues).toEqual([50]);
    expect(result.domain).toEqual({ min: 50, max: 50 });
  });

  it('should generate nice tick values for positive range', () => {
    const result = computeValueTickValues({
      minimum: 0,
      maximum: 100,
      tickCount: 5,
    });

    expect(result.tickValues.length).toBeGreaterThanOrEqual(2);
    expect(result.domain.min).toBeLessThanOrEqual(0);
    expect(result.domain.max).toBeGreaterThanOrEqual(100);
  });

  it('should handle negative ranges', () => {
    const result = computeValueTickValues({
      minimum: -100,
      maximum: -10,
      tickCount: 5,
    });

    expect(result.tickValues.length).toBeGreaterThanOrEqual(2);
    expect(result.domain.min).toBeLessThanOrEqual(-100);
    expect(result.domain.max).toBeGreaterThanOrEqual(-10);
  });
});
