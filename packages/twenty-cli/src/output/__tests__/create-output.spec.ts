import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createStandardInputStub } from '@/__tests__/utils/create-standard-input-stub';
import { setStandardErrorTerminalForTest } from '@/__tests__/utils/set-standard-error-terminal-for-test';
import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';
import { createOutput } from '@/output/create-output';

let stdout: string;
let stderr: string;
let combined: string;
let restoreTerminal: () => void;
let previousExitCode: typeof process.exitCode;

beforeEach(() => {
  stdout = '';
  stderr = '';
  combined = '';
  previousExitCode = process.exitCode;
  restoreTerminal = setStandardErrorTerminalForTest();
  vi.stubEnv('CI', '');
  vi.stubEnv('TERM', 'xterm-256color');
  vi.spyOn(process, 'stdin', 'get').mockReturnValue(
    createStandardInputStub({ isTerminal: false }),
  );
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
    stdout += String(chunk);
    combined += String(chunk);

    return true;
  });
  vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
    stderr += String(chunk);
    combined += String(chunk);

    return true;
  });
});

afterEach(() => {
  restoreTerminal();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  process.exitCode = previousExitCode;
});

describe('terminal progress', () => {
  it('updates one stderr line even when stdin is not a terminal', () => {
    const output = createOutput({ mode: 'human', command: 'data export' });

    output.progress({ message: 'Exporting companies…', percentage: 25 });
    output.progress({ message: 'Exporting companies…', percentage: 75 });

    expect(stdout).toBe('');
    expect(stderr).toContain('█████░░░░░░░░░░░░░░░  25%');
    expect(stderr).toContain('\u001b[1G\u001b[2KExporting companies…');
    expect(stderr).toContain('███████████████░░░░░  75%');
    expect(stderr).not.toContain('\n');
  });

  it.each([
    { terminal: false, ci: '', term: 'xterm' },
    { terminal: true, ci: 'true', term: 'xterm' },
    { terminal: true, ci: '1', term: 'xterm' },
    { terminal: true, ci: '', term: 'dumb' },
  ])(
    'uses plain lines for $terminal / $ci / $term',
    ({ terminal, ci, term }) => {
      process.stderr.isTTY = terminal;
      vi.stubEnv('CI', ci);
      vi.stubEnv('TERM', term);
      const output = createOutput({ mode: 'human', command: 'data export' });

      output.progress({ message: 'Exporting companies…', percentage: 25 });
      output.progress({ message: 'Exporting companies…', percentage: 75 });

      expect(stderr).toBe(
        'Exporting companies… 25%\nExporting companies… 75%\n',
      );
      expect(stdout).toBe('');
    },
  );

  it.each(['false', '0'])('allows a bar when CI is %s', (ci) => {
    vi.stubEnv('CI', ci);
    const output = createOutput({ mode: 'human', command: 'data export' });

    output.progress({ message: 'Exporting companies…', percentage: 25 });

    expect(stderr).toContain('█');
  });

  it('shortens the bar to fit the terminal and falls back to lines if too narrow', () => {
    process.stderr.columns = 40;
    const output = createOutput({ mode: 'human', command: 'data export' });

    output.progress({ message: 'Exporting companies…', percentage: 25 });

    expect(stderr.length).toBeLessThan(40);
    expect(stderr).toContain('░');
    output.progress({ message: 'Downloading CSV…' });
    stderr = '';
    process.stderr.columns = 25;
    output.progress({ message: 'Exporting companies…', percentage: 75 });

    expect(stderr).toBe('Exporting companies… 75%\n');
  });

  it.each([
    '界'.repeat(12),
    '\u001b[32m' + '界'.repeat(12) + '\u001b[0m',
    '👨‍👩‍👧‍👦'.repeat(12),
    'e\u0301'.repeat(24),
  ])('fits a bar to displayed terminal columns for %s', (message) => {
    process.stderr.columns = 40;
    const output = createOutput({ mode: 'human', command: 'data export' });

    output.progress({ message, percentage: 25 });

    expect(stderr).toBe(`${message}  ██░░░░░░  25%`);
    output.progress({ message: 'Downloading CSV…' });
    expect(stderr).toBe(
      `${message}  ██░░░░░░  25%\u001b[1G\u001b[2KDownloading CSV…\n`,
    );
  });

  it('uses a plain line when wide text leaves no room for a bar', () => {
    process.stderr.columns = 35;
    const output = createOutput({ mode: 'human', command: 'data export' });
    const message = '界'.repeat(12);

    output.progress({ message, percentage: 25 });

    expect(stderr).toBe(`${message} 25%\n`);
  });

  it('includes percentages in NDJSON progress and omits them when absent', () => {
    const output = createOutput({ mode: 'ndjson', command: 'data export' });

    output.progress({ message: 'Starting export…', percentage: 0 });
    output.progress({ message: 'Exporting companies…', percentage: 25 });
    output.progress({ message: 'Downloading CSV…' });

    expect(stderr).toBe('');
    expect(
      stdout
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line)),
    ).toEqual([
      {
        schemaVersion: 1,
        command: 'data export',
        type: 'progress',
        sequence: 1,
        data: { message: 'Starting export…', percentage: 0 },
      },
      {
        schemaVersion: 1,
        command: 'data export',
        type: 'progress',
        sequence: 2,
        data: { message: 'Exporting companies…', percentage: 25 },
      },
      {
        schemaVersion: 1,
        command: 'data export',
        type: 'progress',
        sequence: 3,
        data: { message: 'Downloading CSV…' },
      },
    ]);
  });

  it('clears the bar before the next ordinary progress line', () => {
    const output = createOutput({ mode: 'human', command: 'data export' });

    output.progress({ message: 'Exporting companies…', percentage: 100 });
    output.progress({ message: 'Downloading CSV…' });

    expect(stderr).toContain('\u001b[1G\u001b[2KDownloading CSV…\n');
  });

  it('clears the bar before a success line on stdout', () => {
    const output = createOutput({ mode: 'human', command: 'data export' });

    output.progress({ message: 'Exporting companies…', percentage: 100 });
    output.succeed({ data: {}, human: 'Exported companies' });

    expect(combined).toContain('\u001b[1G\u001b[2KExported companies\n');
    expect(stdout).toBe('Exported companies\n');
  });

  it('clears the bar when a warning is queued', () => {
    const output = createOutput({ mode: 'human', command: 'data export' });

    output.progress({ message: 'Exporting companies…', percentage: 25 });
    output.warn({ code: 'WARNING', message: 'A warning' });

    expect(stderr.endsWith('\u001b[1G\u001b[2K')).toBe(true);
    output.succeed({ data: {}, human: 'Done' });
    expect(combined).toContain('Done\n');
    expect(stderr).toContain('A warning');
  });

  it.each([
    new CliError({
      code: 'NETWORK_ERROR',
      message: 'The connection was lost.',
    }),
    createCancelledError(),
  ])('clears the bar before $code', (error) => {
    const output = createOutput({ mode: 'human', command: 'data export' });

    output.progress({ message: 'Exporting companies…', percentage: 25 });
    output.fail(error);

    const cleared = stderr.indexOf('\u001b[1G\u001b[2K');

    expect(cleared).toBeGreaterThan(0);
    expect(stderr.indexOf(error.message)).toBeGreaterThan(cleared);
    expect(process.exitCode).toBe(error.exitCode);
  });

  it('keeps JSON diagnostics plain and emits one result envelope', () => {
    const output = createOutput({ mode: 'json', command: 'data export' });

    output.progress({ message: 'Exporting companies…', percentage: 25 });
    output.succeed({ data: { bytes: 42 }, human: 'Done' });

    expect(stderr).toBe('Exporting companies… 25%\n');
    expect(JSON.parse(stdout)).toMatchObject({ ok: true, data: { bytes: 42 } });
    expect(stdout.trim().split('\n')).toHaveLength(1);
  });

  it('keeps NDJSON progress and results unchanged on a terminal', async () => {
    const output = createOutput({ mode: 'ndjson', command: 'data export' });

    await output.event(
      'progress',
      { id: 'export-id', progress: 25 },
      new AbortController().signal,
    );
    output.succeed({ data: { bytes: 42 } });

    expect(stderr).toBe('');
    expect(
      stdout
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line)),
    ).toMatchObject([
      {
        type: 'progress',
        sequence: 1,
        data: { id: 'export-id', progress: 25 },
      },
      { type: 'result', sequence: 2, data: { bytes: 42 } },
    ]);
  });
});
