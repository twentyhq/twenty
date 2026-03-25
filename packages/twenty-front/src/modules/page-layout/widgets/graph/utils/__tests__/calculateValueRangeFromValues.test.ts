import { calculateValueRangeFromValues } from '@/page-layout/widgets/graph/utils/calculateValueRangeFromValues';

describe('calculateValueRangeFromValues', () => {
  it('should return minimum=0 and maximum=highest value for all positive values', () => {
    const values = [5, 10, 15, 20];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: 0, maximum: 20 });
  });

  it('should return minimum=lowest value and maximum=0 for all negative values', () => {
    const values = [-5, -10, -15, -20];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: -20, maximum: 0 });
  });

  it('should include zero in range when values cross zero', () => {
    const values = [-10, -5, 5, 10];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: -10, maximum: 10 });
  });

  it('should handle empty array', () => {
    const values: number[] = [];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: 0, maximum: 0 });
  });

  it('should ignore NaN values', () => {
    const values = [5, NaN, 10, NaN, 15];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: 0, maximum: 15 });
  });

  it('should handle all NaN values', () => {
    const values = [NaN, NaN, NaN];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: 0, maximum: 0 });
  });

  it('should handle single value', () => {
    const values = [42];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: 0, maximum: 42 });
  });

  it('should handle single negative value', () => {
    const values = [-42];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: -42, maximum: 0 });
  });

  it('should handle zero value', () => {
    const values = [0];

    const result = calculateValueRangeFromValues(values);

    expect(result).toEqual({ minimum: 0, maximum: 0 });
  });
});
