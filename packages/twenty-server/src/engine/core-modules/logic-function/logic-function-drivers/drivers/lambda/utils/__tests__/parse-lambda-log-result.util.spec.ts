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
});
