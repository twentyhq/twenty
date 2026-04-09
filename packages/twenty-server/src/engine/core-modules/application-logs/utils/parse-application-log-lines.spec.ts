import { parseApplicationLogLines } from './parse-application-log-lines';

describe('parseApplicationLogLines', () => {
  it('should return an empty array for empty string', () => {
    expect(parseApplicationLogLines('')).toEqual([]);
  });

  it('should return an empty array for undefined-ish input', () => {
    expect(parseApplicationLogLines(undefined as unknown as string)).toEqual(
      [],
    );
  });

  it('should parse a structured INFO log line', () => {
    const raw = '2024-06-15T10:30:00.123Z INFO Hello world';
    const result = parseApplicationLogLines(raw);

    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toEqual(new Date('2024-06-15T10:30:00.123Z'));
    expect(result[0].level).toBe('INFO');
    expect(result[0].message).toBe('Hello world');
  });

  it('should parse all supported log levels', () => {
    const raw = [
      '2024-01-01T00:00:00.000Z INFO info message',
      '2024-01-01T00:00:01.000Z ERROR error message',
      '2024-01-01T00:00:02.000Z WARN warn message',
      '2024-01-01T00:00:03.000Z DEBUG debug message',
    ].join('\n');

    const result = parseApplicationLogLines(raw);

    expect(result).toHaveLength(4);
    expect(result[0].level).toBe('INFO');
    expect(result[1].level).toBe('ERROR');
    expect(result[2].level).toBe('WARN');
    expect(result[3].level).toBe('DEBUG');
  });

  it('should default unstructured lines to INFO with current timestamp', () => {
    const now = Date.now();
    const raw = 'some plain text without timestamp or level';
    const result = parseApplicationLogLines(raw);

    expect(result).toHaveLength(1);
    expect(result[0].level).toBe('INFO');
    expect(result[0].message).toBe(
      'some plain text without timestamp or level',
    );
    expect(result[0].timestamp.getTime()).toBeGreaterThanOrEqual(now);
    expect(result[0].timestamp.getTime()).toBeLessThanOrEqual(now + 1000);
  });

  it('should skip empty lines', () => {
    const raw = '2024-01-01T00:00:00.000Z INFO first\n\n\n2024-01-01T00:00:01.000Z ERROR second\n';
    const result = parseApplicationLogLines(raw);

    expect(result).toHaveLength(2);
    expect(result[0].message).toBe('first');
    expect(result[1].message).toBe('second');
  });

  it('should handle a mix of structured and unstructured lines', () => {
    const raw = [
      '2024-01-01T00:00:00.000Z INFO structured line',
      'plain unstructured line',
      '2024-01-01T00:00:01.000Z ERROR another structured',
    ].join('\n');

    const result = parseApplicationLogLines(raw);

    expect(result).toHaveLength(3);
    expect(result[0].level).toBe('INFO');
    expect(result[0].message).toBe('structured line');
    expect(result[1].level).toBe('INFO');
    expect(result[1].message).toBe('plain unstructured line');
    expect(result[2].level).toBe('ERROR');
    expect(result[2].message).toBe('another structured');
  });

  it('should preserve message content including special characters', () => {
    const raw =
      '2024-01-01T00:00:00.000Z INFO {"key": "value", "count": 42}';
    const result = parseApplicationLogLines(raw);

    expect(result[0].message).toBe('{"key": "value", "count": 42}');
  });
});
