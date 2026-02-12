import { computeEffectiveValueRange } from '@/page-layout/widgets/graph/utils/computeEffectiveValueRange';

describe('computeEffectiveValueRange', () => {
  describe('minimum value calculation', () => {
    it('should start from 0 for non-negative values', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 5,
        calculatedMaximum: 100,
      });

      expect(result.effectiveMinimumValue).toBe(0);
    });

    it('should use calculated minimum for negative values', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: -50,
        calculatedMaximum: 100,
      });

      expect(result.effectiveMinimumValue).toBe(-50);
    });

    it('should use explicit rangeMin when provided', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 0,
        calculatedMaximum: 100,
        rangeMin: 25,
      });

      expect(result.effectiveMinimumValue).toBe(25);
    });
  });

  describe('maximum value calculation', () => {
    it('should add 10% padding for non-negative values without explicit rangeMax', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 0,
        calculatedMaximum: 100,
      });

      expect(result.effectiveMaximumValue).toBe(110);
    });

    it('should use minimum padding of 1 for small values', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 0,
        calculatedMaximum: 5,
      });

      expect(result.effectiveMaximumValue).toBe(6);
    });

    it('should not add padding when rangeMax is explicit', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 0,
        calculatedMaximum: 100,
        rangeMax: 100,
      });

      expect(result.effectiveMaximumValue).toBe(100);
    });

    it('should not add padding when there are negative values', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: -50,
        calculatedMaximum: 100,
      });

      expect(result.effectiveMaximumValue).toBe(100);
    });

    it('should use explicit rangeMax when provided', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 0,
        calculatedMaximum: 100,
        rangeMax: 50,
      });

      expect(result.effectiveMaximumValue).toBe(50);
    });
  });

  describe('edge cases', () => {
    it('should add padding when min equals max and no explicit range', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 50,
        calculatedMaximum: 50,
      });

      expect(result.effectiveMaximumValue).toBeGreaterThan(
        result.effectiveMinimumValue,
      );
    });

    it('should not add padding when min equals max but explicit range is provided', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 50,
        calculatedMaximum: 50,
        rangeMin: 0,
        rangeMax: 100,
      });

      expect(result.effectiveMinimumValue).toBe(0);
      expect(result.effectiveMaximumValue).toBe(100);
    });

    it('should handle zero values', () => {
      const result = computeEffectiveValueRange({
        calculatedMinimum: 0,
        calculatedMaximum: 0,
      });

      expect(result.effectiveMinimumValue).toBe(0);
      expect(result.effectiveMaximumValue).toBe(1);
    });
  });
});
