import { formatPgCopyField } from 'src/database/commands/workspace-export/utils/format-pg-copy-value.util';

describe('formatPgCopyField', () => {
  it('should return \\N for null and undefined', () => {
    expect(formatPgCopyField(null)).toBe('\\N');
    expect(formatPgCopyField(undefined)).toBe('\\N');
  });

  it('should return t/f for booleans (not true/false)', () => {
    expect(formatPgCopyField(true)).toBe('t');
    expect(formatPgCopyField(false)).toBe('f');
  });

  it('should return \\N for non-finite numbers', () => {
    expect(formatPgCopyField(NaN)).toBe('\\N');
    expect(formatPgCopyField(Infinity)).toBe('\\N');
  });

  it('should escape tabs, newlines, and backslashes in strings', () => {
    expect(formatPgCopyField('col1\tcol2')).toBe('col1\\tcol2');
    expect(formatPgCopyField('line1\nline2')).toBe('line1\\nline2');
    expect(formatPgCopyField('path\\to\\file')).toBe('path\\\\to\\\\file');
    expect(formatPgCopyField('a\r\nb')).toBe('a\\r\\nb');
  });

  it('should not quote strings (COPY format is unquoted)', () => {
    const result = formatPgCopyField('hello world');

    expect(result).toBe('hello world');
    expect(result).not.toContain("'");
  });

  it('should format dates as ISO strings without quotes', () => {
    const date = new Date('2024-01-15T10:30:00.000Z');

    expect(formatPgCopyField(date)).toBe('2024-01-15T10:30:00.000Z');
  });

  it('should escape special chars in JSON column values', () => {
    const value = { key: 'value\twith\ttabs' };

    expect(formatPgCopyField(value, true)).toBe(
      '{"key":"value\\\\twith\\\\ttabs"}',
    );
  });

  it('should format PostgreSQL array literals', () => {
    expect(formatPgCopyField([])).toBe('{}');
    expect(formatPgCopyField(['a', 'b'])).toBe('{"a","b"}');
    expect(formatPgCopyField(['val\twith\ttab'])).toBe('{"val\\twith\\ttab"}');
  });

  it('should JSON-serialize arrays of objects with escaping', () => {
    const value = [{ id: 1, name: 'test\ttab' }];

    expect(formatPgCopyField(value)).toBe('[{"id":1,"name":"test\\\\ttab"}]');
  });

  it('should handle a row with mixed types matching COPY tab-delimited format', () => {
    const fields = [
      formatPgCopyField('abc-123'),
      formatPgCopyField(null),
      formatPgCopyField(true),
      formatPgCopyField(42),
      formatPgCopyField(new Date('2025-03-28T00:00:00.000Z')),
    ];

    expect(fields.join('\t')).toBe(
      'abc-123\t\\N\tt\t42\t2025-03-28T00:00:00.000Z',
    );
  });
});
