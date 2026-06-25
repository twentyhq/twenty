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

  it('should preserve explicit domain bounds when requested', () => {
    const result = computeValueTickValues({
      minimum: 0,
      maximum: 10,
      tickCount: 2,
      preserveDomainBounds: true,
    });

    expect(result.domain).toEqual({ min: 0, max: 10 });
    expect(result.tickValues[0]).toBe(0);
    expect(result.tickValues[result.tickValues.length - 1]).toBe(10);
    expect(result.tickValues.every((tick) => tick >= 0 && tick <= 10)).toBe(
      true,
    );
  });

  it('should still allow domain expansion when preserving bounds is disabled', () => {
    const result = computeValueTickValues({
      minimum: 0,
      maximum: 10,
      tickCount: 2,
    });

    expect(result.domain.max).toBeGreaterThan(10);
  });
});
