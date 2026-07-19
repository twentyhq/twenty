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

  it('should normalize date with MONTH granularity to the backend dimension', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'MONTH',
    });
    expect(result).toBe('2024-01-01');
  });

  it('should normalize date with YEAR granularity to the backend dimension', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'YEAR',
    });
    expect(result).toBe('2024-01-01');
  });

  it('should normalize date with DAY_OF_THE_WEEK granularity to the backend dimension', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'DAY_OF_THE_WEEK',
    });
    expect(result).toBe('Monday');
  });

  it('should normalize date with MONTH_OF_THE_YEAR granularity to the backend dimension', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'MONTH_OF_THE_YEAR',
    });
    expect(result).toBe('January');
  });

  it('should preserve a backend date dimension value', () => {
    const result = normalizeGroupByDimensionValue('2024-01-01', {
      granularity: 'MONTH',
    });
    expect(result).toBe('2024-01-01');
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
