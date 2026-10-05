import { setImmediate } from 'node:timers/promises';

import { isNonEmptyString } from '@sniptt/guards';
import {
  assertIsDefinedOrThrow,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
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
import { sendJson, startTestServer } from '@/__tests__/utils/start-test-server';
import { type DataRecord } from '@/data/types/data-page.type';
import { runCli } from '@/run-cli';

const company = {
  id: 'company-object',
  nameSingular: 'company',
  namePlural: 'companies',
};
let objects = [company];
let records: DataRecord[] = [];
let record: unknown;
let status = 200;
let metadataDenied = false;
let failPageAfter = false;
let invalidPayload: unknown;
let cursorCycle: string[] | undefined;
let restRequests = 0;

const server = await startTestServer((request, response) => {
  const url = new URL(request.path, 'http://fixture');

  if (url.pathname === '/metadata') {
    return sendJson(
      response,
      200,
      metadataDenied
        ? {
            errors: [
              { message: 'Forbidden', extensions: { code: 'FORBIDDEN' } },
            ],
            data: null,
          }
        : {
            data: {
              objects: {
                edges: objects.map((object) => ({ node: object })),
                pageInfo: { hasNextPage: false, endCursor: null },
              },
            },
          },
    );
  }

  restRequests += 1;
  const cursor = url.searchParams.get('starting_after');

  if (status !== 200 || (failPageAfter && isNonEmptyString(cursor))) {
    return sendJson(response, status !== 200 ? status : 403, {
      message: 'Request denied',
    });
  }

  if (isDefined(invalidPayload)) {
    return sendJson(response, 200, invalidPayload);
  }

  const object = objects.find((candidate) =>
    url.pathname.startsWith(`/rest/${candidate.namePlural}`),
  );

  if (!isDefined(object)) {
    return sendJson(response, 404, {});
  }

  if (url.pathname !== `/rest/${object.namePlural}`) {
    return sendJson(response, 200, { data: { [object.nameSingular]: record } });
  }

  const offset = Number(cursor ?? 0);
  const limit = Number(url.searchParams.get('limit'));
  const nextOffset = offset + limit;
  const pageRecords = isDefined(cursorCycle)
    ? records.slice(0, limit)
    : records.slice(offset, nextOffset);
  const getEndCursor = () => {
    if (isDefined(cursorCycle)) {
      return cursorCycle[(restRequests - 1) % cursorCycle.length];
    }

    return isNonEmptyArray(pageRecords)
      ? String(Math.min(nextOffset, records.length))
      : null;
  };

  return sendJson(response, 200, {
    data: { [object.namePlural]: pageRecords },
    totalCount: records.length,
    pageInfo: {
      hasPreviousPage: offset > 0,
      hasNextPage: isDefined(cursorCycle) || nextOffset < records.length,
      startCursor: isNonEmptyArray(pageRecords) ? String(offset) : null,
      endCursor: getEndCursor(),
    },
  });
});

const getLastRequest = () => {
  const lastRequest = server.requests.at(-1);

  assertIsDefinedOrThrow(lastRequest);

  return lastRequest;
};

const runJson = async (args: string[]) => {
  const result = await runCliForTest(['data', ...args, '--json']);
  return { ...result, envelope: parseSingleJsonLine(result.stdout) };
};

const runStream = async (args: string[]) => {
  const result = await runCliForTest([
    'data',
    'list',
    ...args,
    '--format',
    'ndjson',
  ]);
  return {
    ...result,
    events: result.stdout
      .trimEnd()
      .split('\n')
      .map((line) => JSON.parse(line)),
  };
};

describe('data inspection commands', () => {
  beforeEach(() => {
    vi.stubEnv('TWENTY_API_URL', server.url);
    vi.stubEnv('TWENTY_API_KEY', 'fixture-data-key');
    vi.stubEnv('TWENTY_REMOTE', '');
    objects = [company];
    records = [
      {
        id: '1',
        name: 'Acme',
        employees: 100,
        domainName: { primaryLinkUrl: 'acme.test' },
      },
      {
        id: '2',
        name: 'Twenty',
        employees: 20,
        domainName: { primaryLinkUrl: 'twenty.test' },
      },
      { id: '3', name: 'Example', employees: 5 },
    ];
    record = records[0];
    status = 200;
    metadataDenied = false;
    failPageAfter = false;
    invalidPayload = undefined;
    cursorCycle = undefined;
    restRequests = 0;
    server.requests.length = 0;
  });

  afterEach(() => vi.unstubAllEnvs());
  afterAll(() => server.close());

  it('defaults to one page of 50, using canonical plural names and paired credentials', async () => {
    records = Array.from({ length: 51 }, (_, index) => ({
      id: String(index),
      name: 'Company',
    }));
    const result = await runJson(['list', 'company']);
    expect(result.exitCode, result.stdout).toBe(0);
    expect(result.envelope.data.records).toHaveLength(50);
    expect(result.envelope.data).toMatchObject({
      totalCount: 51,
      pageInfo: { hasNextPage: true, endCursor: '50' },
    });
    expect(restRequests).toBe(1);
    expect(getLastRequest()).toMatchObject({
      path: '/rest/companies?limit=50',
      method: 'GET',
      headers: { authorization: 'Bearer fixture-data-key' },
    });
  });

  it('preserves REST filters, ordering and opaque cursor contents without interpreting them', async () => {
    const filter = "name[eq]:A&B + O'Reilly";
    const order = 'employees[DescNullsLast],id[AscNullsFirst]';
    await runJson([
      'list',
      'companies',
      '--filter',
      filter,
      '--order-by',
      order,
      '--limit',
      '2',
      '--cursor',
      '1',
    ]);
    const url = new URL(getLastRequest().path, server.url);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      limit: '2',
      starting_after: '1',
      filter,
      order_by: order,
    });
    await runJson(['list', 'companies', '--cursor', 'opaque+/=&?']);
    expect(
      new URL(getLastRequest().path, server.url).searchParams.get(
        'starting_after',
      ),
    ).toBe('opaque+/=&?');
  });

  it('resolves custom objects for list and get without generated types', async () => {
    objects = [
      { id: 'invoice-object', nameSingular: 'invoice', namePlural: 'invoices' },
    ];
    expect((await runJson(['list', 'invoice'])).envelope.data.records).toEqual(
      records,
    );
    const result = await runJson(['get', 'invoices', '1']);
    expect(result.envelope.data).toEqual(record);
    expect(getLastRequest().path).toBe('/rest/invoices/1?depth=1');
  });

  it('rejects ambiguous aliases before sending a REST request', async () => {
    objects.push({
      id: 'second',
      nameSingular: 'companies',
      namePlural: 'companies2',
    });
    const result = await runJson(['list', 'companies']);
    expect(result.exitCode).toBe(2);
    expect(result.envelope.error.code).toBe('AMBIGUOUS_RESOURCE');
    expect(restRequests).toBe(0);
  });

  it.each(['Companies', 'COMPANIES', 'comp'])(
    'does not guess the object name %s',
    async (name) => {
      const result = await runJson(['list', name]);
      expect(result.exitCode).toBe(4);
      expect(restRequests).toBe(0);
    },
  );

  it.each(['0', '-1', '201', '1.5', 'NaN', 'Infinity', '1e2', ''])(
    'rejects invalid page limit %s before network access',
    async (limit) => {
      const result = await runJson(['list', 'companies', '--limit', limit]);
      expect(result.exitCode).toBe(2);
      expect(result.envelope.error.code).toBe('USAGE');
      expect(server.requests).toHaveLength(0);
    },
  );

  it('accepts 200 as the page size', async () => {
    expect(
      (await runJson(['list', 'companies', '--limit', '200'])).exitCode,
    ).toBe(0);
  });

  it.each([
    ['--fields', 'name,'],
    ['--cursor', ''],
  ])('rejects empty values for %s', async (flag, value) => {
    expect((await runJson(['list', 'companies', flag, value])).exitCode).toBe(
      2,
    );
    expect(server.requests).toHaveLength(0);
  });

  it('collects every remaining page and retains final pagination information', async () => {
    const result = await runJson([
      'list',
      'companies',
      '--limit',
      '1',
      '--cursor',
      '1',
      '--all',
    ]);
    expect(result.envelope.data.records).toEqual(records.slice(1));
    expect(result.envelope.data.pageInfo).toMatchObject({
      hasNextPage: false,
      endCursor: '3',
    });
    expect(
      server.requests
        .filter((request) => request.path.startsWith('/rest'))
        .map((request) =>
          new URL(request.path, server.url).searchParams.get('starting_after'),
        ),
    ).toEqual(['1', '2']);
  });

  it('keeps all fields in JSON while selecting only human table columns', async () => {
    const result = await runJson(['list', 'companies', '--fields', 'name']);
    expect(result.envelope.data.records[0]).toEqual(records[0]);
    const human = await runCliForTest([
      'data',
      'list',
      'companies',
      '--fields',
      'name,domainName',
      '--limit',
      '1',
      '--filter',
      "name[eq]:O'Reilly",
      '--order-by',
      'name',
    ]);
    expect(human.stdout).toContain('Acme');
    expect(human.stdout).toContain('acme.test');
    expect(human.stdout).not.toContain('employees');
    expect(human.stdout).toContain(
      '1 of 3 records · --all for every page · --json for the next cursor',
    );
    expect(human.stdout).not.toContain('--cursor');
    const page = await runJson(['list', 'companies', '--limit', '1']);
    expect(page.envelope.data.pageInfo).toMatchObject({
      hasNextPage: true,
      endCursor: '1',
    });
  });

  it('returns an empty list with page information and useful human output', async () => {
    records = [];
    expect((await runJson(['list', 'companies'])).envelope.data).toEqual({
      records: [],
      totalCount: 0,
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: null,
        endCursor: null,
      },
    });
    expect(
      (await runCliForTest(['data', 'list', 'companies'])).stdout,
    ).toContain('No records.');
  });

  it('shows composites and related records while preserving their raw JSON', async () => {
    record = {
      id: '1',
      name: { firstName: 'Jane', lastName: 'Cooper' },
      emails: { primaryEmail: 'jane@example.test' },
      company: { id: '2', name: 'Acme' },
      active: false,
      nullable: null,
    };
    expect((await runJson(['get', 'companies', '1'])).envelope.data).toEqual(
      record,
    );
    const human = await runCliForTest(['data', 'get', 'company', '1']);
    expect(human.stdout).toContain('Jane Cooper');
    expect(human.stdout).toContain('jane@example.test');
    expect(human.stdout).toContain('Acme (2)');
    expect(human.stdout).toContain('false');
  });

  it('summarizes returned related records and bounds detail values in human output', async () => {
    record = {
      id: '1',
      name: 'Acme',
      people: [
        {
          id: 'p1',
          name: { firstName: 'Jane', lastName: 'Cooper' },
          notes: 'x'.repeat(5_000),
        },
        { id: 'p2', name: { firstName: 'Ann', lastName: 'Lee' } },
        { id: 'p3', title: 'Buyer' },
        { id: 'p4' },
      ],
      manager: { id: 'm1', title: 'Head of sales' },
      taskTargets: [],
      workPolicy: ['REMOTE_WORK', 'HYBRID'],
      tagline: 'y'.repeat(5_000),
    };

    const human = await runCliForTest(['data', 'get', 'companies', '1']);
    const lines = human.stdout.split('\n');

    expect(human.exitCode).toBe(0);
    expect(human.stdout).toContain(
      '4 records returned · Jane Cooper, Ann Lee, Buyer, …',
    );
    expect(human.stdout).toContain('Head of sales (m1)');
    expect(human.stdout).toContain('REMOTE_WORK, HYBRID');
    expect(lines.find((line) => line.includes('taskTargets'))).toMatch(
      /taskTargets\s+-$/,
    );
    expect(human.stdout).toContain(`${'y'.repeat(119)}…`);
    expect(human.stdout).not.toContain('x'.repeat(100));
    expect(Math.max(...lines.map((line) => line.length))).toBeLessThan(160);
    expect((await runJson(['get', 'companies', '1'])).envelope.data).toEqual(
      record,
    );
  });

  it('warns once in human output when no returned record has a requested field', async () => {
    const human = await runCliForTest([
      'data',
      'list',
      'companies',
      '--fields',
      'name,nope',
    ]);
    const all = await runCliForTest([
      'data',
      'list',
      'companies',
      '--all',
      '--limit',
      '1',
      '--fields',
      'nope',
    ]);
    const json = await runJson(['list', 'companies', '--fields', 'nope']);

    records = [];

    const empty = await runCliForTest([
      'data',
      'list',
      'companies',
      '--fields',
      'nope',
    ]);

    expect(human.exitCode).toBe(0);
    expect(human.stdout).toContain('Acme');
    expect(human.stderr).toContain(
      'No returned record has nope; see twenty metadata field list companies.',
    );
    expect(all.stderr.match(/No returned record has nope/g)).toHaveLength(1);
    expect(json.envelope.warnings).toEqual([]);
    expect(empty.stderr).not.toContain('No returned record');
  });

  it('escapes record control characters in human tables without altering JSON', async () => {
    records = [{ id: '1', name: 'Acme\n\u001b[31m' }];
    const result = await runCliForTest([
      'data',
      'list',
      'companies',
      '--fields',
      'name',
    ]);
    expect(result.stdout).toContain('Acme\\n\\u001b[31m');
    expect(
      (await runJson(['list', 'companies'])).envelope.data.records,
    ).toEqual(records);
  });

  it.each([
    [401, 3],
    [403, 3],
    [404, 4],
    [429, 1],
    [500, 1],
  ])('preserves HTTP %s failures', async (responseStatus, expectedExitCode) => {
    status = responseStatus;
    const result = await runJson(['get', 'companies', '1']);
    expect(result.envelope.ok).toBe(false);
    expect(result.envelope.error.details.status).toBe(responseStatus);
    expect(result.exitCode).toBe(expectedExitCode);
    expect(restRequests).toBe(1);
  });

  it('bounds table cell widths and treats absent columns as absent values', async () => {
    records = [
      { id: '1', name: 'x'.repeat(100_000) },
      { id: '2', name: 'Short' },
    ];
    const result = await runCliForTest([
      'data',
      'list',
      'companies',
      '--fields',
      'name,toString',
    ]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.length).toBeLessThan(300);
    expect(result.stdout).toContain('x'.repeat(59) + '…');
    expect(result.stdout).toContain('Short');
    expect(result.stdout).toContain('-');
  });

  it('rejects a REST page that exceeds the requested page size', async () => {
    invalidPayload = {
      data: { companies: records },
      totalCount: records.length,
      pageInfo: { hasNextPage: false, startCursor: '0', endCursor: '3' },
    };
    expect(
      (await runJson(['list', 'companies', '--limit', '1'])).envelope.error
        .code,
    ).toBe('INVALID_RESPONSE');
  });

  it('rejects a non-progressing final page instead of claiming completion', async () => {
    invalidPayload = {
      data: { companies: [records[0]] },
      totalCount: 3,
      pageInfo: { hasNextPage: false, startCursor: '1', endCursor: '1' },
    };
    const result = await runJson([
      'list',
      'companies',
      '--cursor',
      '1',
      '--all',
    ]);
    expect(result.envelope.error.code).toBe('INVALID_RESPONSE');
  });

  it('rejects malformed single-record responses', async () => {
    record = [];
    expect((await runJson(['get', 'companies', '1'])).envelope.error.code).toBe(
      'INVALID_RESPONSE',
    );
  });

  it('maps a null single-record response to NOT_FOUND', async () => {
    record = null;
    expect((await runJson(['get', 'companies', '1'])).exitCode).toBe(4);
  });

  it('encodes record ids as one path segment and rejects traversal segments', async () => {
    await runJson(['get', 'companies', 'a/b?c=d#e']);
    expect(getLastRequest().path).toBe(
      '/rest/companies/a%2Fb%3Fc%3Dd%23e?depth=1',
    );
    for (const id of ['.', '..']) {
      expect((await runJson(['get', 'companies', id])).exitCode).toBe(2);
    }
    expect(restRequests).toBe(1);
  });

  it('preserves metadata permission errors without trying REST', async () => {
    metadataDenied = true;
    expect((await runJson(['list', 'companies'])).exitCode).toBe(3);
    expect(restRequests).toBe(0);
  });

  it('fetches object metadata afresh on each invocation', async () => {
    expect((await runJson(['list', 'companies'])).exitCode).toBe(0);
    metadataDenied = true;
    expect((await runJson(['list', 'companies'])).exitCode).toBe(3);
    expect(restRequests).toBe(1);
  });

  it.each([
    {},
    {
      data: { companies: null },
      totalCount: 0,
      pageInfo: { hasNextPage: false, startCursor: null, endCursor: null },
    },
    { data: { companies: [] }, totalCount: 0, pageInfo: {} },
    {
      data: { companies: [] },
      totalCount: 0,
      pageInfo: { hasNextPage: true, startCursor: null, endCursor: null },
    },
    {
      data: { companies: [{}] },
      totalCount: 1,
      pageInfo: { hasNextPage: true, startCursor: '0', endCursor: '' },
    },
    {
      data: { companies: [null] },
      totalCount: 1,
      pageInfo: { hasNextPage: false, startCursor: null, endCursor: null },
    },
  ])('fails explicitly on malformed REST pagination %#', async (payload) => {
    invalidPayload = payload;
    const result = await runJson(['list', 'companies', '--all']);
    expect(result.envelope.error.code).toBe('INVALID_RESPONSE');
    expect(result.exitCode).toBe(1);
  });

  it.each([['1'], ['1', '2', '3']])(
    'detects pagination cycles without a successful partial result %#',
    async (...cycle) => {
      cursorCycle = cycle;
      const result = await runJson(['list', 'companies', '--all']);
      expect(result.envelope.error.code).toBe('INVALID_RESPONSE');
      expect(restRequests).toBeLessThan(12);
    },
  );

  it('fails finite JSON on page-two errors without leaking a partial success', async () => {
    failPageAfter = true;
    const result = await runJson([
      'list',
      'companies',
      '--all',
      '--limit',
      '1',
    ]);
    expect(result.exitCode).toBe(3);
    expect(result.envelope.error.code).toBe('PERMISSION_DENIED');
    expect(result.envelope.data).toBeUndefined();
  });

  it('rejects results over 10,000 records in JSON and human modes', async () => {
    records = Array.from({ length: 10_001 }, (_, index) => ({
      id: String(index),
    }));
    const json = await runJson([
      'list',
      'companies',
      '--all',
      '--limit',
      '200',
    ]);
    expect(json.exitCode).toBe(2);
    expect(json.envelope.error).toMatchObject({
      code: 'RESULT_LIMIT_EXCEEDED',
      details: { recordCount: 10_001 },
    });
    expect(json.envelope.error.hint).toContain('--format ndjson');
    const human = await runCliForTest([
      'data',
      'list',
      'companies',
      '--all',
      '--limit',
      '200',
    ]);
    expect(human.exitCode).toBe(2);
    expect(human.stdout).toBe('');
  });

  it('accepts exactly 10,000 records in a finite result', async () => {
    records = Array.from({ length: 10_000 }, (_, index) => ({
      id: String(index),
    }));
    const result = await runJson([
      'list',
      'companies',
      '--all',
      '--limit',
      '200',
    ]);
    expect(result.exitCode, result.stdout).toBe(0);
    expect(result.envelope.data.records).toHaveLength(10_000);
  });

  it('bounds combined payload bytes across individually valid pages', async () => {
    records = [
      { id: '1', text: 'x'.repeat(9 * 1024 * 1024) },
      { id: '2', text: 'x'.repeat(9 * 1024 * 1024) },
    ];
    const result = await runJson([
      'list',
      'companies',
      '--all',
      '--limit',
      '1',
    ]);
    expect(result.envelope.error.code).toBe('RESULT_LIMIT_EXCEEDED');
    expect(result.envelope.error.details.bytes).toBeGreaterThan(
      16 * 1024 * 1024,
    );
    expect(result.exitCode).toBe(2);
  });

  it('still enforces the per-response transport cap in streaming mode', async () => {
    records = [{ id: '1', text: 'x'.repeat(17 * 1024 * 1024) }];
    const result = await runStream(['companies', '--all']);
    expect(result.exitCode).toBe(1);
    expect(result.events.at(-1)).toMatchObject({
      type: 'error',
      data: { code: 'RESPONSE_LIMIT_EXCEEDED' },
    });
    expect(result.events.some((event) => event.type === 'record')).toBe(false);
  });

  it('streams numbered events beyond the finite item limit and terminates once', async () => {
    records = Array.from({ length: 10_001 }, (_, index) => ({
      id: String(index),
      fullRecord: true,
    }));
    const result = await runStream([
      'companies',
      '--all',
      '--limit',
      '200',
      '--fields',
      'id',
    ]);
    expect(result.exitCode, result.stdout).toBe(0);
    expect(result.events[0]).toMatchObject({
      type: 'start',
      data: { object: 'companies', target: { apiUrl: server.url } },
    });
    expect(
      result.events.filter((event) => event.type === 'record'),
    ).toHaveLength(10_001);
    expect(result.events[1].data).toEqual(records[0]);
    expect(result.events.at(-1)).toMatchObject({
      type: 'result',
      data: {
        recordCount: 10_001,
        pages: 51,
        pageInfo: { hasNextPage: false },
      },
    });
    expect(
      result.events.filter((event) => ['result', 'error'].includes(event.type)),
    ).toHaveLength(1);
    expect(
      result.events.every(
        (event, index) =>
          event.sequence === index + 1 &&
          event.schemaVersion === 1 &&
          event.command === 'data list',
      ),
    ).toBe(true);
  });

  it('preserves delivered records and a completed-page cursor when a later page fails', async () => {
    failPageAfter = true;
    const result = await runStream(['companies', '--all', '--limit', '1']);
    expect(result.exitCode).toBe(3);
    expect(
      result.events
        .filter((event) => event.type === 'record')
        .map((event) => event.data),
    ).toEqual([records[0]]);
    expect(result.events.at(-1)).toMatchObject({
      type: 'error',
      data: {
        code: 'PERMISSION_DENIED',
        details: { recordCount: 1, pages: 1, resumeCursor: '1' },
      },
    });
    expect(result.events.some((event) => event.type === 'result')).toBe(false);
  });

  it('streams only one page without --all', async () => {
    const result = await runStream(['companies', '--limit', '1']);
    expect(restRequests).toBe(1);
    expect(result.events.at(-1).data.pageInfo.hasNextPage).toBe(true);
  });

  it.each([false, true])(
    'stops fetching under stdout backpressure, cancel=%s',
    async (cancel) => {
      let stdout = '';
      const blocked = Promise.withResolvers<void>();
      const stdoutSpy = vi
        .spyOn(process.stdout, 'write')
        .mockImplementation((chunk) => {
          stdout += String(chunk);
          if (stdout.trimEnd().split('\n').length === 2) {
            blocked.resolve();
            return false;
          }
          return true;
        });
      const previousExitCode = process.exitCode;
      process.exitCode = undefined;

      try {
        const pending = runCli([
          'data',
          'list',
          'companies',
          '--all',
          '--limit',
          '1',
          '--format',
          'ndjson',
        ]);
        await blocked.promise;
        await setImmediate();
        await setImmediate();
        expect(restRequests).toBe(1);
        if (cancel) {
          process.emit('SIGINT');
        } else {
          process.stdout.emit('drain');
        }
        await pending;
        const events = stdout
          .trimEnd()
          .split('\n')
          .map((line) => JSON.parse(line));
        if (cancel) {
          expect(Number(process.exitCode)).toBe(130);
          expect(events.at(-1)).toMatchObject({
            type: 'error',
            data: {
              code: 'CANCELLED',
              details: { pages: 0, resumeCursor: null },
            },
          });
          expect(restRequests).toBe(1);
        } else {
          expect(restRequests).toBe(3);
          expect(events.at(-1).type).toBe('result');
        }
      } finally {
        stdoutSpy.mockRestore();
        process.exitCode = previousExitCode;
      }
    },
  );

  it('advertises only the implemented output modes and works without credentials for help', async () => {
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.stubEnv('TWENTY_API_URL', '');
    const help = await runCliForTest(['data', 'list', '--help']);
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain('--cursor');
    const commands = parseSingleJsonLine(
      (await runCliForTest(['commands', '--json'])).stdout,
    ).data.commands;
    expect(
      commands.find(
        (command: { name: string }) => command.name === 'data list',
      ),
    ).toMatchObject({
      outputs: ['human', 'json', 'ndjson'],
      writes: false,
      needsProject: false,
    });
    expect(
      (
        await runCliForTest([
          'data',
          'get',
          'companies',
          '1',
          '--format',
          'ndjson',
        ])
      ).exitCode,
    ).toBe(2);
    expect(server.requests).toHaveLength(0);
  });
});
