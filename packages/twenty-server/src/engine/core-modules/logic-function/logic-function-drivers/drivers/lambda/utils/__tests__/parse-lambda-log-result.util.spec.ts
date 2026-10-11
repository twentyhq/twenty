import { parseLambdaLogResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/parse-lambda-log-result.util';

const toBase64 = (input: string): string =>
  Buffer.from(input, 'utf8').toString('base64');

describe('parseLambdaLogResult', () => {
  it('returns empty defaults when logResult is undefined', () => {
    expect(parseLambdaLogResult(undefined)).toEqual({
      logs: '',
      initDurationMs: null,
      billedDurationMs: null,
      reportDurationMs: null,
      coldStart: false,
    });
  });

  it('returns empty defaults when logResult is an empty string', () => {
    expect(parseLambdaLogResult('')).toEqual({
      logs: '',
      initDurationMs: null,
      billedDurationMs: null,
      reportDurationMs: null,
      coldStart: false,
    });
  });

  it('extracts Init/Billed/Duration milliseconds from a REPORT line and flags coldStart=true', () => {
    const raw = [
      'START RequestId: 1 Version: $LATEST',
      '2026-06-02T12:00:00.000Z 11111111-1111-1111-1111-111111111111 INFO hello',
      'END RequestId: 1',
      'REPORT RequestId: 1 Duration: 12.34 ms Billed Duration: 13 ms Memory Size: 512 MB Max Memory Used: 100 MB Init Duration: 250.50 ms',
    ].join('\n');

    const result = parseLambdaLogResult(toBase64(raw));

    expect(result.initDurationMs).toBe('250.50');
    expect(result.billedDurationMs).toBe('13');
    expect(result.reportDurationMs).toBe('12.34');
    expect(result.coldStart).toBe(true);
  });

  it('flags coldStart=false when no Init Duration is present', () => {
    const raw =
      'REPORT RequestId: 1 Duration: 5 ms Billed Duration: 5 ms Memory Size: 512 MB Max Memory Used: 100 MB';

    const result = parseLambdaLogResult(toBase64(raw));

    expect(result.initDurationMs).toBeNull();
    expect(result.coldStart).toBe(false);
    expect(result.reportDurationMs).toBe('5');
    expect(result.billedDurationMs).toBe('5');
  });

  it('strips START/END/REPORT lines, request-id from INFO lines, and normalizes tabs to spaces', () => {
    const raw = [
      'START RequestId: abc',
      '2026-06-02T12:00:00.000Z\t11111111-1111-1111-1111-111111111111\tINFO\thello',
      'END RequestId: abc',
      'REPORT RequestId: abc Duration: 5 ms',
    ].join('\n');

    const result = parseLambdaLogResult(toBase64(raw));

    expect(result.logs).toBe('2026-06-02T12:00:00.000Z INFO hello');
  });

  it('trims leading and trailing whitespace from logs', () => {
    const raw = [
      'START RequestId: abc',
      '',
      '2026-06-02T12:00:00.000Z 11111111-1111-1111-1111-111111111111 INFO line',
      '',
      'END RequestId: abc',
    ].join('\n');

    const result = parseLambdaLogResult(toBase64(raw));

    expect(result.logs.startsWith('2026-06-02T12:00:00.000Z INFO line')).toBe(
      true,
    );
    expect(result.logs.endsWith('INFO line')).toBe(true);
  });

  it('reads JSON platform.report metrics and keeps application logs', () => {
    const applicationLog = JSON.stringify({
      timestamp: '2026-06-02T12:00:00.000Z',
      level: 'INFO',
      message: 'hello',
    });
    const raw = [
      JSON.stringify({
        time: '2026-06-02T12:00:00.000Z',
        type: 'platform.start',
        record: { requestId: 'request-id', version: '$LATEST' },
      }),
      applicationLog,
      JSON.stringify({
        time: '2026-06-02T12:00:00.694Z',
        type: 'platform.runtimeDone',
        record: { requestId: 'request-id', status: 'success' },
      }),
      JSON.stringify({
        time: '2026-06-02T12:00:00.694Z',
        type: 'platform.report',
        record: {
          requestId: 'request-id',
          metrics: {
            billedDurationMs: 694,
            durationMs: 693.92,
            initDurationMs: 397.68,
            maxMemoryUsedMB: 84,
            memorySizeMB: 128,
          },
        },
      }),
    ].join('\n');

    expect(parseLambdaLogResult(toBase64(raw))).toEqual({
      logs: applicationLog,
      initDurationMs: '397.68',
      billedDurationMs: '694',
      reportDurationMs: '693.92',
      coldStart: true,
    });
  });

  it('reads a warm JSON report after a truncated log line', () => {
    const raw = [
      'tail of a truncated log entry"}',
      JSON.stringify({
        type: 'platform.report',
        record: { metrics: { billedDurationMs: 1, durationMs: 0 } },
      }),
    ].join('\n');

    expect(parseLambdaLogResult(toBase64(raw))).toEqual({
      logs: 'tail of a truncated log entry"}',
      initDurationMs: null,
      billedDurationMs: '1',
      reportDurationMs: '0',
      coldStart: false,
    });
  });

  it('does not coerce invalid JSON metric values', () => {
    const raw = JSON.stringify({
      type: 'platform.report',
      record: {
        metrics: {
          billedDurationMs: -1,
          durationMs: '12.34',
          initDurationMs: {},
        },
      },
    });

    expect(parseLambdaLogResult(toBase64(raw))).toEqual({
      logs: '',
      initDurationMs: null,
      billedDurationMs: null,
      reportDurationMs: null,
      coldStart: false,
    });
  });

  it('ignores unrelated JSON and incomplete report objects', () => {
    const raw = [
      JSON.stringify({
        message: 'application log',
        record: { metrics: { durationMs: 12, initDurationMs: 10 } },
      }),
      JSON.stringify({ type: 'platform.report', record: null }),
      JSON.stringify({ type: 'platform.report', record: { metrics: null } }),
    ].join('\n');

    expect(parseLambdaLogResult(toBase64(raw))).toEqual({
      logs: raw,
      initDurationMs: null,
      billedDurationMs: null,
      reportDurationMs: null,
      coldStart: false,
    });
  });
});
