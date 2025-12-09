import { computeEffectiveValueRange } from '../computeEffectiveValueRange';

describe('computeEffectiveValueRange', () => {
  it('should return hasNoData true when dataLength is 0', () => {
    const result = computeEffectiveValueRange({
      calculatedMinimum: 0,
      calculatedMaximum: 0,
      dataLength: 0,
    });

    expect(result.hasNoData).toBe(true);
  });

  it('should start from 0 for non-negative values', () => {
    const result = computeEffectiveValueRange({
      calculatedMinimum: 5,
      calculatedMaximum: 100,
      dataLength: 10,
    });

    expect(result.effectiveMinimumValue).toBe(0);
    expect(result.hasNoData).toBe(false);
  });

  it('should use calculated minimum for negative values', () => {
    const result = computeEffectiveValueRange({
      calculatedMinimum: -50,
      calculatedMaximum: 100,
      dataLength: 10,
    });

    expect(result.effectiveMinimumValue).toBe(-50);
  });

  it('should respect explicit rangeMin and rangeMax', () => {
    const result = computeEffectiveValueRange({
      calculatedMinimum: 0,
      calculatedMaximum: 100,
      rangeMin: 10,
      rangeMax: 50,
      dataLength: 10,
    });

    expect(result.effectiveMinimumValue).toBe(10);
    expect(result.effectiveMaximumValue).toBe(50);
  });

  it('should add padding when min equals max and no explicit range', () => {
    const result = computeEffectiveValueRange({
      calculatedMinimum: 50,
      calculatedMaximum: 50,
      dataLength: 1,
    });

    expect(result.effectiveMaximumValue).toBeGreaterThan(
      result.effectiveMinimumValue,
    );
  });
});
