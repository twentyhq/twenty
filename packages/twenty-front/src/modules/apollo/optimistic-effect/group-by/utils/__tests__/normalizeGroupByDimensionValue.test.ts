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

  it('should handle date with DAY granularity as YYYY-MM-DD', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, { granularity: 'DAY' });
    expect(result).toBe('2024-01-15');
  });

  it('should handle date with MONTH granularity as first day YYYY-MM-DD', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'MONTH',
    });
    expect(result).toBe('2024-01-01');
  });

  it('should handle date with YEAR granularity as Jan 1 YYYY-MM-DD', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'YEAR',
    });
    expect(result).toBe('2024-01-01');
  });

  it('should handle date with QUARTER granularity as quarter start YYYY-MM-DD', () => {
    const date = new Date('2024-05-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'QUARTER',
    });
    expect(result).toBe('2024-04-01');
  });

  it('should handle DAY_OF_THE_WEEK as English day name matching backend TMDay', () => {
    // 2024-01-15 is a Monday
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'DAY_OF_THE_WEEK',
    });
    expect(result).toBe('Monday');
  });

  it('should handle MONTH_OF_THE_YEAR as English month name matching backend TMMonth', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'MONTH_OF_THE_YEAR',
    });
    expect(result).toBe('January');
  });

  it('should handle QUARTER_OF_THE_YEAR as Qn', () => {
    const date = new Date('2024-05-15T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'QUARTER_OF_THE_YEAR',
    });
    expect(result).toBe('Q2');
  });

  it('should handle WEEK as Monday-start YYYY-MM-DD', () => {
    // 2024-01-17 is Wednesday → week starts Monday 2024-01-15
    const date = new Date('2024-01-17T10:30:00Z');
    const result = normalizeGroupByDimensionValue(date, {
      granularity: 'WEEK',
    });
    expect(result).toBe('2024-01-15');
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
