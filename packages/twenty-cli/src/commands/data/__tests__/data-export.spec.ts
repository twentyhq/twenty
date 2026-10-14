import { writeFileSync } from 'node:fs';
import * as fileSystem from 'node:fs/promises';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setImmediate } from 'node:timers';

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { setStandardErrorTerminalForTest } from '@/__tests__/utils/set-standard-error-terminal-for-test';
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import * as configPath from '@/config/get-config-path';

vi.mock('node:fs/promises', async (importOriginal) => {
  const original = await importOriginal<typeof fileSystem>();
  return { ...original, link: vi.fn(original.link), rm: vi.fn(original.rm) };
});

const EXPORT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CSV = '\uFEFFId,Name\nrecord-1,Acme\n';
const DOWNLOAD_PATH = `/file/record-export/${EXPORT_ID}?token=private.signed.token`;
const fields = [
  { id: 'field-name', name: 'name', isActive: true, isSystem: false },
  { id: 'field-employees', name: 'employees', isActive: true, isSystem: false },
  { id: 'field-position', name: 'position', isActive: true, isSystem: true },
  { id: 'field-inactive', name: 'inactive', isActive: false, isSystem: false },
];
const next = (data: unknown) =>
  `event: next\ndata: ${JSON.stringify(data)}\n\n`;
let directory: string;
let outputPath: string;
let downloadPath = DOWNLOAD_PATH;
let downloadStatus = 200;
let exportError: string | undefined;
let subscriptionError: string | undefined;
let interruptStream = false;
let interruptDownload = false;
let completeWithoutDownload = false;
let contentType = 'text/csv';
let cancellation: 'subscription' | 'download' | undefined;
let createDestinationDuringDownload = false;
const server = await startTestServer((request, response) => {
  if (request.method === 'GET') {
    if (createDestinationDuringDownload) {
      writeFileSync(outputPath, 'created while exporting');
    }
    if (cancellation === 'download') {
      response.writeHead(200, { 'content-type': 'text/csv' });
      response.write('partial');
      setTimeout(() => process.emit('SIGINT'), 20);
      return;
    }
    if (downloadStatus !== 200) {
      return sendJson(
        response,
        downloadStatus,
        {},
        { location: 'https://other.invalid/' },
      );
    }
    response.writeHead(200, {
      'content-type': contentType,
      ...(interruptDownload ? { 'content-length': '999' } : {}),
    });
    if (interruptDownload) {
      response.write('partial');
      setImmediate(() => response.destroy());
    } else {
      response.end(CSV);
    }
    return;
  }
  const { query } = JSON.parse(request.body);
  if (query.includes('subscription ExportRecords')) {
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    if (subscriptionError) {
      response.end(
        next({
          errors: [
            { message: subscriptionError, extensions: { code: 'FORBIDDEN' } },
          ],
        }),
      );
      return;
    }
    response.write(
      next({
        data: {
          exportRecords: {
            id: EXPORT_ID,
            filename: 'company.csv',
            progress: 20,
            errorMessage: null,
            downloadPath: null,
          },
        },
      }),
    );
    if (cancellation === 'subscription') {
      setTimeout(() => process.emit('SIGINT'), 20);
      return;
    }
    if (interruptStream) {
      response.end();
      return;
    }
    if (!completeWithoutDownload) {
      response.write(
        next({
          data: {
            exportRecords: {
              id: EXPORT_ID,
              filename: 'company.csv',
              progress: exportError ? 20 : 100,
              errorMessage: exportError ?? null,
              downloadPath: exportError ? null : downloadPath,
            },
          },
        }),
      );
    }
    response.end('event: complete\n\n');
    return;
  }
  const isFields = query.includes('fields(');
  sendJson(response, 200, {
    data: {
      [isFields ? 'fields' : 'objects']: {
        edges: (isFields
          ? fields
          : [
              {
                id: 'company-object',
                nameSingular: 'company',
                namePlural: 'companies',
              },
            ]
        ).map((node) => ({ node })),
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  });
});
const run = (...options: string[]) =>
  runCliForTest([
    'data',
    'export',
    'companies',
    '--output',
    outputPath,
    ...options,
  ]);
const assertNoTemporaryFiles = async () =>
  expect(
    (await readdir(directory)).filter((name) => name.endsWith('.tmp')),
  ).toEqual([]);

beforeEach(async () => {
  vi.mocked(fileSystem.link).mockReset();
  vi.mocked(fileSystem.rm).mockReset();
  directory = await mkdtemp(join(tmpdir(), 'twenty-export-test-'));
  outputPath = join(directory, 'companies.csv');
  vi.stubEnv('TWENTY_API_URL', server.url);
  vi.stubEnv('TWENTY_API_KEY', 'fixture-export-key');
  vi.stubEnv('TWENTY_REMOTE', '');
  server.requests.length = 0;
  downloadPath = DOWNLOAD_PATH;
  downloadStatus = 200;
  exportError = undefined;
  subscriptionError = undefined;
  interruptStream = false;
  interruptDownload = false;
  completeWithoutDownload = false;
  contentType = 'text/csv';
  cancellation = undefined;
  createDestinationDuringDownload = false;
});
afterEach(async () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await rm(directory, { recursive: true, force: true });
});
afterAll(async () => server.close());

describe('twenty data export', () => {
  it('resolves selected fields, translates REST filters and downloads with the original credential', async () => {
    const result = await run(
      '--fields',
      'name,employees',
      '--filter',
      'and(employees[gte]:5000,name[neq]:Other)',
      '--order-by',
      'employees[DescNullsLast]',
      '--format',
      'json',
    );
    expect(result.exitCode).toBe(0);
    expect(parseSingleJsonLine(result.stdout)).toMatchObject({
      ok: true,
      data: {
        id: EXPORT_ID,
        object: 'companies',
        outputPath,
        bytes: Buffer.byteLength(CSV),
      },
    });
    expect(await readFile(outputPath, 'utf8')).toBe(CSV);
    const subscription = server.requests.find((request) =>
      request.body.includes('subscription ExportRecords'),
    )!;
    expect(JSON.parse(subscription.body).variables.input).toEqual({
      objectMetadataId: 'company-object',
      fieldMetadataIds: ['field-name', 'field-employees'],
      filter: {
        and: [{ employees: { gte: '5000' } }, { name: { neq: 'Other' } }],
      },
      orderBy: [{ employees: 'DescNullsLast' }, { id: 'AscNullsLast' }],
    });
    expect(server.requests.at(-1)).toMatchObject({
      method: 'GET',
      path: DOWNLOAD_PATH,
      headers: { authorization: 'Bearer fixture-export-key' },
    });
    expect(subscription.headers.authorization).toBe(
      'Bearer fixture-export-key',
    );
    expect(result.stdout + result.stderr).not.toContain('private.signed.token');
    await assertNoTemporaryFiles();
  });

  it('uses a saved browser session for both the subscription and the download', async () => {
    const accessToken = [
      Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url'),
      Buffer.from(
        JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }),
      ).toString('base64url'),
      'fixture-signature',
    ].join('.');
    const path = join(directory, 'config.json');
    await writeFile(
      path,
      JSON.stringify({
        version: 1,
        defaultRemote: 'test',
        remotes: {
          test: { apiUrl: server.url, twentyCLIAccessToken: accessToken },
        },
      }),
    );
    vi.spyOn(configPath, 'getConfigPath').mockReturnValue(path);
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_API_KEY', '');

    const result = await run('--format', 'json');

    expect(result.exitCode).toBe(0);
    expect(await readFile(outputPath, 'utf8')).toBe(CSV);
    const subscription = server.requests.find((request) =>
      request.body.includes('subscription ExportRecords'),
    );
    expect(subscription?.headers.authorization).toBe(`Bearer ${accessToken}`);
    expect(server.requests.at(-1)).toMatchObject({
      method: 'GET',
      headers: { authorization: `Bearer ${accessToken}` },
    });
    expect(result.stdout + result.stderr).not.toContain(accessToken);
    await assertNoTemporaryFiles();
  });

  it('uses active non-system fields by default and emits structured progress', async () => {
    const result = await run('--format', 'ndjson');
    expect(result.exitCode).toBe(0);
    const events = result.stdout
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(events.map((event) => event.type)).toEqual([
      'start',
      'progress',
      'progress',
      'result',
    ]);
    expect(events[1].data).toEqual({ id: EXPORT_ID, progress: 20 });
    const subscription = server.requests.find((request) =>
      request.body.includes('subscription ExportRecords'),
    )!;
    expect(
      JSON.parse(subscription.body).variables.input.fieldMetadataIds,
    ).toEqual(['field-employees', 'field-name']);
  });

  it('prints a human success message only after saving the CSV', async () => {
    const result = await run('--fields', 'name');
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(`Exported companies to ${outputPath}`);
    expect(result.stderr).toContain('Exporting companies… 20%');
    expect(await readFile(outputPath, 'utf8')).toBe(CSV);
  });

  it('renders a terminal progress bar and clears it before downloading', async () => {
    const restoreTerminal = setStandardErrorTerminalForTest();

    vi.stubEnv('CI', '');
    vi.stubEnv('TERM', 'xterm-256color');

    try {
      const result = await run();

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toContain('████░░░░░░░░░░░░░░░░  20%');
      expect(result.stderr).toContain('████████████████████  100%');
      expect(result.stderr).toContain('\u001b[1G\u001b[2KDownloading CSV…\n');
      expect(result.stdout).toContain(`Exported companies to ${outputPath}`);
      expect(await readFile(outputPath, 'utf8')).toBe(CSV);
    } finally {
      restoreTerminal();
    }
  });

  it('clears the terminal bar when Ctrl-C interrupts generation', async () => {
    const restoreTerminal = setStandardErrorTerminalForTest();

    vi.stubEnv('CI', '');
    vi.stubEnv('TERM', 'xterm-256color');
    cancellation = 'subscription';

    try {
      const result = await run();

      expect(result.exitCode).toBe(130);
      expect(result.stderr).toContain('░');
      expect(result.stderr.indexOf('Cancelled.')).toBeGreaterThan(
        result.stderr.lastIndexOf('\u001b[1G\u001b[2K'),
      );
      expect(result.stdout).toBe('');
      expect(await readdir(directory)).toEqual([]);
    } finally {
      restoreTerminal();
    }
  });

  it.each(['missing', 'inactive'])(
    'rejects %s fields before starting an export',
    async (field) => {
      const result = await run('--fields', field, '--format', 'json');
      expect(result.exitCode).not.toBe(0);
      expect(
        server.requests.some((request) =>
          request.body.includes('subscription'),
        ),
      ).toBe(false);
      expect(await readdir(directory)).toEqual([]);
    },
  );

  it('refuses to overwrite a file unless requested, before making requests', async () => {
    await writeFile(outputPath, 'keep me');
    const result = await run('--format', 'json');
    expect(parseSingleJsonLine(result.stdout)).toMatchObject({
      ok: false,
      error: { code: 'CONFLICT' },
    });
    expect(await readFile(outputPath, 'utf8')).toBe('keep me');
    expect(server.requests).toHaveLength(0);
  });

  it('replaces an existing file with --force only on successful completion', async () => {
    await writeFile(outputPath, 'keep me');
    expect((await run('--force')).exitCode).toBe(0);
    expect(await readFile(outputPath, 'utf8')).toBe(CSV);
    await assertNoTemporaryFiles();
  });

  it('preserves the existing file and removes partial output when the download fails', async () => {
    await writeFile(outputPath, 'keep me');
    interruptDownload = true;
    const result = await run('--force', '--format', 'json');
    expect(result.exitCode).not.toBe(0);
    expect(await readFile(outputPath, 'utf8')).toBe('keep me');
    await assertNoTemporaryFiles();
  });

  it.each(['interrupted', 'completed-too-early', 'worker-failed'])(
    'fails without a final CSV when the export is %s',
    async (failure) => {
      interruptStream = failure === 'interrupted';
      completeWithoutDownload = failure === 'completed-too-early';
      exportError =
        failure === 'worker-failed'
          ? 'Access permissions have changed.'
          : undefined;
      const result = await run('--format', 'json');
      expect(result.exitCode).not.toBe(0);
      expect(await readdir(directory)).toEqual([]);
    },
  );

  it.each(['subscription', 'download'] as const)(
    'cleans up when cancelled during %s',
    async (phase) => {
      cancellation = phase;
      await writeFile(outputPath, 'keep me');
      const result = await run('--force', '--format', 'json');
      expect(result.exitCode).toBe(130);
      expect(parseSingleJsonLine(result.stdout)).toMatchObject({
        ok: false,
        error: { code: 'CANCELLED' },
      });
      expect(await readFile(outputPath, 'utf8')).toBe('keep me');
      await assertNoTemporaryFiles();
    },
  );

  it('preserves a destination created after the initial existence check', async () => {
    createDestinationDuringDownload = true;
    const result = await run('--format', 'json');
    expect(result.exitCode).not.toBe(0);
    expect(parseSingleJsonLine(result.stdout)).toMatchObject({
      ok: false,
      error: { code: 'CONFLICT' },
    });
    expect(await readFile(outputPath, 'utf8')).toBe('created while exporting');
    await assertNoTemporaryFiles();
  });

  it('reports an inaccessible output directory before starting the export', async () => {
    outputPath = join(directory, 'missing', 'companies.csv');
    const result = await run('--format', 'json');
    expect(parseSingleJsonLine(result.stdout)).toMatchObject({
      ok: false,
      error: {
        code: 'FILE_WRITE_FAILED',
        message: `Could not save the CSV file to ${outputPath}.`,
      },
    });
    expect(server.requests).toHaveLength(0);
    await assertNoTemporaryFiles();
  });

  it('rejects a filesystem without hard links before requesting an export', async () => {
    vi.mocked(fileSystem.link).mockRejectedValueOnce(
      Object.assign(new Error('hard links unsupported'), { code: 'ENOTSUP' }),
    );
    const result = await run('--format', 'json');
    expect(parseSingleJsonLine(result.stdout)).toMatchObject({
      ok: false,
      error: {
        code: 'FILE_WRITE_FAILED',
        hint: expect.stringContaining('--force'),
      },
    });
    expect(server.requests).toHaveLength(0);
    expect(await readdir(directory)).toEqual([]);
  });

  it('can export with --force when hard links are unsupported', async () => {
    vi.mocked(fileSystem.link).mockRejectedValue(
      Object.assign(new Error('hard links unsupported'), { code: 'ENOTSUP' }),
    );
    const result = await run('--force', '--format', 'json');
    expect(result.exitCode).toBe(0);
    expect(await readFile(outputPath, 'utf8')).toBe(CSV);
    expect(fileSystem.link).not.toHaveBeenCalled();
    await assertNoTemporaryFiles();
  });

  it.each(['EROFS', 'EDQUOT', 'EIO'])(
    'reports %s during file commit as a file error',
    async (code) => {
      const original =
        await vi.importActual<typeof fileSystem>('node:fs/promises');
      vi.mocked(fileSystem.link)
        .mockImplementationOnce(original.link)
        .mockRejectedValueOnce(
          Object.assign(new Error('disk failure'), { code }),
        );
      const result = await run('--format', 'json');
      expect(parseSingleJsonLine(result.stdout)).toMatchObject({
        ok: false,
        error: { code: 'FILE_WRITE_FAILED' },
      });
      expect(await readdir(directory)).toEqual([]);
    },
  );

  it('keeps a successful export successful when temporary-file cleanup fails', async () => {
    vi.mocked(fileSystem.rm).mockRejectedValueOnce(
      Object.assign(new Error('file is busy'), { code: 'EBUSY' }),
    );
    const result = await run('--format', 'json');
    expect(result.exitCode).toBe(0);
    expect(parseSingleJsonLine(result.stdout)).toMatchObject({ ok: true });
    expect(await readFile(outputPath, 'utf8')).toBe(CSV);
  });

  it.each(['NETWORK_ERROR', 'EXPORT_FAILED', 'CANCELLED'] as const)(
    'preserves %s when temporary-file cleanup fails',
    async (code) => {
      interruptDownload = code === 'NETWORK_ERROR';
      exportError = code === 'EXPORT_FAILED' ? 'Export failed' : undefined;
      cancellation = code === 'CANCELLED' ? 'download' : undefined;
      await writeFile(outputPath, 'keep me');
      vi.mocked(fileSystem.rm).mockRejectedValueOnce(
        Object.assign(new Error('file is busy'), { code: 'EBUSY' }),
      );
      const result = await run('--force', '--format', 'json');
      expect(result.exitCode).toBe(code === 'CANCELLED' ? 130 : 1);
      expect(parseSingleJsonLine(result.stdout)).toMatchObject({
        ok: false,
        error: { code },
      });
      expect(await readFile(outputPath, 'utf8')).toBe('keep me');
    },
  );

  it('reports the disabled feature flag without creating a CSV', async () => {
    subscriptionError =
      'Asynchronous CSV export is not enabled for this workspace';
    const result = await run('--format', 'json');
    expect(result.exitCode).not.toBe(0);
    expect(result.stdout).toContain(subscriptionError);
    expect(await readdir(directory)).toEqual([]);
  });

  it.each([403, 302])(
    'fails safely when the download returns %s',
    async (status) => {
      downloadStatus = status;
      const result = await run('--format', 'json');
      expect(result.exitCode).not.toBe(0);
      expect(result.stdout + result.stderr).not.toContain(
        'private.signed.token',
      );
      expect(await readdir(directory)).toEqual([]);
    },
  );

  it('rejects an external download URL without sending credentials or displaying the token', async () => {
    downloadPath = 'https://other.invalid/export?token=private.signed.token';
    const result = await run('--format', 'json');
    expect(result.exitCode).not.toBe(0);
    expect(result.stdout + result.stderr).not.toContain('private.signed.token');
    expect(server.requests.some((request) => request.method === 'GET')).toBe(
      false,
    );
    expect(await readdir(directory)).toEqual([]);
  });

  it('rejects an HTML response instead of saving it as CSV', async () => {
    contentType = 'text/html';
    expect((await run('--format', 'json')).exitCode).not.toBe(0);
    expect(await readdir(directory)).toEqual([]);
  });
});
