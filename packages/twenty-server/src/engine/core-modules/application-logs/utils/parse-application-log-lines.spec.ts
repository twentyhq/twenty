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

    expect(parseApplicationLogLines(raw)).toEqual([
      {
        timestamp: new Date('2024-06-15T10:30:00.123Z'),
        level: 'INFO',
        message: 'Hello world',
      },
    ]);
  });

  it('should parse all supported log levels', () => {
    const raw = [
      '2024-01-01T00:00:00.000Z INFO info message',
      '2024-01-01T00:00:01.000Z ERROR error message',
      '2024-01-01T00:00:02.000Z WARN warn message',
      '2024-01-01T00:00:03.000Z DEBUG debug message',
    ].join('\n');

    expect(parseApplicationLogLines(raw)).toEqual([
      {
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        level: 'INFO',
        message: 'info message',
      },
      {
        timestamp: new Date('2024-01-01T00:00:01.000Z'),
        level: 'ERROR',
        message: 'error message',
      },
      {
        timestamp: new Date('2024-01-01T00:00:02.000Z'),
        level: 'WARN',
        message: 'warn message',
      },
      {
        timestamp: new Date('2024-01-01T00:00:03.000Z'),
        level: 'DEBUG',
        message: 'debug message',
      },
    ]);
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
    const raw =
      '2024-01-01T00:00:00.000Z INFO first\n\n\n2024-01-01T00:00:01.000Z ERROR second\n';

    expect(parseApplicationLogLines(raw)).toEqual([
      {
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        level: 'INFO',
        message: 'first',
      },
      {
        timestamp: new Date('2024-01-01T00:00:01.000Z'),
        level: 'ERROR',
        message: 'second',
      },
    ]);
  });

  it('should handle a mix of structured and unstructured lines', () => {
    const raw = [
      '2024-01-01T00:00:00.000Z INFO structured line',
      'plain unstructured line',
      '2024-01-01T00:00:01.000Z ERROR another structured',
    ].join('\n');

    const result = parseApplicationLogLines(raw);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      timestamp: new Date('2024-01-01T00:00:00.000Z'),
      level: 'INFO',
      message: 'structured line',
    });
    expect(result[1].level).toBe('INFO');
    expect(result[1].message).toBe('plain unstructured line');
    expect(result[2]).toEqual({
      timestamp: new Date('2024-01-01T00:00:01.000Z'),
      level: 'ERROR',
      message: 'another structured',
    });
  });

  it('should preserve message content including special characters', () => {
    const raw = '2024-01-01T00:00:00.000Z INFO {"key": "value", "count": 42}';

    expect(parseApplicationLogLines(raw)).toEqual([
      {
        timestamp: new Date('2024-01-01T00:00:00.000Z'),
        level: 'INFO',
        message: '{"key": "value", "count": 42}',
      },
    ]);
  });
});
