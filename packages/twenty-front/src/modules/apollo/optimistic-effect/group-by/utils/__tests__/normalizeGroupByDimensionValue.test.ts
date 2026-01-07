import { normalizeGroupByDimensionValue } from '@/apollo/optimistic-effect/group-by/utils/normalizeGroupByDimensionValue';

describe('normalizeGroupByDimensionValue', () => {
  it('should convert string to string', () => {
    const result = normalizeGroupByDimensionValue('test', undefined);
    expect(result).toBe('test');
  });

  it('should convert number to string', () => {
    const result = normalizeGroupByDimensionValue(123, undefined);
    expect(result).toBe('123');
  });

  it('should handle date with DAY granularity', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, { granularity: 'DAY' });
    expect(result).toBe('2024-01-15');
  });

  it('should handle date with MONTH granularity', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'MONTH',
    });
    expect(result).toBe('2024-01');
  });

  it('should handle date with YEAR granularity', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'YEAR',
    });
    expect(result).toBe('2024');
  });

  it('should handle object with id', () => {
    const obj = { id: '123', name: 'test' };
    const result = normalizeGroupByDimensionValue(obj, undefined);
    expect(result).toBe('123');
  });

  it('should handle object without id', () => {
    const obj = { name: 'test' };
    const result = normalizeGroupByDimensionValue(obj, undefined);
    expect(result).toBe(JSON.stringify(obj));
  });
});
