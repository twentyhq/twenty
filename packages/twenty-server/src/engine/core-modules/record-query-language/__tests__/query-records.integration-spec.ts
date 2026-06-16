import { randomUUID } from 'node:crypto';

import request from 'supertest';

import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';

// Exercises the `query` AI tool end to end: MCP -> execute_tool -> QueryRecordsService
// -> compiler -> Common API -> Postgres, against the seeded test workspace.

type McpToolCallResult = {
  content?: Array<{ type: string; text: string }>;
  isError?: boolean;
};

type ToolPayload<TResult> = {
  success: boolean;
  message: string;
  result?: TResult;
  error?: string;
};

type CreatedRecord = { id: string };

type CompanyRecord = { id: string; name: string; employees: number };

type FindResult = { records: CompanyRecord[]; count: number };

type GroupByResult = {
  groups: Array<{ dimensions: unknown[]; value: string | number }>;
  dimensionLabels: string[];
  aggregation: string;
  groupCount: number;
};

const baseUrl = `http://localhost:${APP_PORT}`;

const postMcp = (body: Record<string, unknown>) =>
  request(baseUrl)
    .post('/mcp')
    .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(JSON.stringify(body));

const callMcpTool = async (
  name: string,
  args: Record<string, unknown>,
): Promise<McpToolCallResult> => {
  const id = `call-${randomUUID()}`;
  const res = await postMcp({
    jsonrpc: '2.0',
    method: 'tools/call',
    id,
    params: { name, arguments: args },
  }).expect(200);

  expect(res.body.error).toBeUndefined();

  return res.body.result as McpToolCallResult;
};

// A tool returning { success: false } is not a transport error, so isError stays
// false and the failed payload is still readable — that is what the error-path
// test below asserts on.
const executeTool = async <TResult>(
  toolName: string,
  args: Record<string, unknown>,
): Promise<ToolPayload<TResult>> => {
  const result = await callMcpTool('execute_tool', {
    toolName,
    arguments: args,
  });

  expect(result.isError).toBe(false);
  expect(result.content?.[0]?.type).toBe('text');

  return JSON.parse(
    result.content?.[0]?.text as string,
  ) as ToolPayload<TResult>;
};

const runQuery = <TResult>(ast: Record<string, unknown>) =>
  executeTool<TResult>('query', ast);

describe('query tool execution (integration)', () => {
  const prefix = `qtool-${randomUUID()}`;
  const createdCompanyIds: string[] = [];

  let betaId: string;
  let gammaId: string;

  const createCompany = async (
    suffix: string,
    employees: number,
  ): Promise<string> => {
    const payload = await executeTool<CreatedRecord>('create_one_company', {
      name: `${prefix} ${suffix}`,
      employees,
    });

    expect(payload.success).toBe(true);

    const id = (payload.result as CreatedRecord).id;

    createdCompanyIds.push(id);

    return id;
  };

  beforeAll(async () => {
    await createCompany('Alpha', 10);
    betaId = await createCompany('Beta', 30);
    gammaId = await createCompany('Gamma', 30);
  });

  afterAll(async () => {
    await deleteRecordsByIds('company', createdCompanyIds);
  });

  it('runs a filtered, ordered find', async () => {
    const payload = await runQuery<FindResult>({
      from: 'company',
      select: ['*'],
      where: { type: 'cmp', field: 'name', op: 'ilike', value: `${prefix}%` },
      orderBy: [{ field: 'employees', direction: 'desc' }],
      limit: 50,
    });

    expect(payload.success).toBe(true);

    const result = payload.result as FindResult;

    expect(result.records).toHaveLength(3);
    expect(result.count).toBe(3);
    expect(result.records[0].employees).toBe(30);
    expect(result.records[result.records.length - 1].employees).toBe(10);
    expect(result.records.map((record) => record.name).sort()).toEqual(
      [`${prefix} Alpha`, `${prefix} Beta`, `${prefix} Gamma`].sort(),
    );
  });

  it('returns the same records as find_many_companies for an equivalent filter', async () => {
    const queryPayload = await runQuery<FindResult>({
      from: 'company',
      select: ['*'],
      where: {
        type: 'and',
        of: [
          { type: 'cmp', field: 'name', op: 'ilike', value: `${prefix}%` },
          { type: 'cmp', field: 'employees', op: 'gte', value: 30 },
        ],
      },
      limit: 50,
    });

    const findManyPayload = await executeTool<FindResult>(
      'find_many_companies',
      {
        select: ['*'],
        limit: 50,
        name: { ilike: `${prefix}%` },
        employees: { gte: 30 },
      },
    );

    expect(queryPayload.success).toBe(true);
    expect(findManyPayload.success).toBe(true);

    const queryIds = (queryPayload.result as FindResult).records
      .map((record) => record.id)
      .sort();
    const findManyIds = (findManyPayload.result as FindResult).records
      .map((record) => record.id)
      .sort();

    expect(queryIds).toEqual([betaId, gammaId].sort());
    expect(queryIds).toEqual(findManyIds);
  });

  it('computes an aggregate', async () => {
    const payload = await runQuery<GroupByResult>({
      from: 'company',
      where: { type: 'cmp', field: 'name', op: 'ilike', value: `${prefix}%` },
      aggregate: { groupBy: [{ field: 'employees' }], operation: 'COUNT' },
    });

    expect(payload.success).toBe(true);

    const result = payload.result as GroupByResult;

    expect(result.dimensionLabels).toEqual(['employees']);
    expect(result.groupCount).toBe(2);

    const countByEmployees = Object.fromEntries(
      result.groups.map((group) => [
        String(group.dimensions[0]),
        Number(group.value),
      ]),
    );

    expect(countByEmployees['10']).toBe(1);
    expect(countByEmployees['30']).toBe(2);
  });

  it('returns a structured error with a suggestion for an unknown field', async () => {
    const payload = await runQuery<FindResult>({
      from: 'company',
      where: { type: 'cmp', field: 'naem', op: 'eq', value: 'x' },
    });

    expect(payload.success).toBe(false);
    expect(payload.error).toContain('naem');
    expect(payload.error).toContain('name');
  });
});
