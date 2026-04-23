import { formatSqlValue } from 'src/database/commands/workspace-export/utils/format-sql-value.util';

describe('formatSqlValue', () => {
  it('should return NULL for null and undefined', () => {
    expect(formatSqlValue(null)).toBe('NULL');
    expect(formatSqlValue(undefined)).toBe('NULL');
  });

  it('should return unquoted TRUE/FALSE for booleans', () => {
    expect(formatSqlValue(true)).toBe('TRUE');
    expect(formatSqlValue(false)).toBe('FALSE');
  });

  it('should return unquoted numbers', () => {
    expect(formatSqlValue(42)).toBe('42');
    expect(formatSqlValue(3.14)).toBe('3.14');
    expect(formatSqlValue(-1)).toBe('-1');
    expect(formatSqlValue(0)).toBe('0');
  });

  it('should return NULL for NaN and Infinity', () => {
    expect(formatSqlValue(NaN)).toBe('NULL');
    expect(formatSqlValue(Infinity)).toBe('NULL');
    expect(formatSqlValue(-Infinity)).toBe('NULL');
  });

  it('should return unquoted bigint', () => {
    expect(formatSqlValue(BigInt(9007199254740991))).toBe('9007199254740991');
  });

  it('should escape single quotes in strings', () => {
    expect(formatSqlValue("it's")).toBe("'it''s'");
  });

  it('should handle backslashes with E-string prefix', () => {
    expect(formatSqlValue('path\\to\\file')).toBe("E'path\\\\to\\\\file'");
  });

  it('should format dates as escaped ISO strings', () => {
    const date = new Date('2024-01-15T10:30:00.000Z');

    expect(formatSqlValue(date)).toBe("'2024-01-15T10:30:00.000Z'");
  });

  it('should JSON-serialize objects when isJsonColumn is true', () => {
    const value = { key: 'value' };

    expect(formatSqlValue(value, true)).toBe('\'{"key":"value"}\'');
  });

  it('should JSON-serialize plain objects even when isJsonColumn is false', () => {
    const value = { key: 'value' };

    expect(formatSqlValue(value, false)).toBe('\'{"key":"value"}\'');
  });

  it('should return empty PostgreSQL array literal for empty arrays', () => {
    expect(formatSqlValue([])).toBe("'{}'");
  });

  it('should format string arrays as PostgreSQL array literals', () => {
    expect(formatSqlValue(['a', 'b', 'c'])).toBe('\'{"a","b","c"}\'');
  });

  it('should escape single quotes in array elements', () => {
    expect(formatSqlValue(["O'Reilly"])).toBe("'{\"O''Reilly\"}'");
  });

  it('should format arrays with null elements as PostgreSQL array literals', () => {
    expect(formatSqlValue([null, 'foo', 'bar'])).toBe('\'{NULL,"foo","bar"}\'');
  });

  it('should JSON-serialize arrays of objects', () => {
    const value = [{ id: 1 }, { id: 2 }];

    expect(formatSqlValue(value)).toBe('\'[{"id":1},{"id":2}]\'');
  });

  it('should throw on strings containing null bytes', () => {
    expect(() => formatSqlValue('hello\0world')).toThrow(
      'Null bytes are not allowed',
    );
  });
});
