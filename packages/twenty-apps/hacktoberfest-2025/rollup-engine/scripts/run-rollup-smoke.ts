import assert from 'node:assert/strict';

import { main as runRollups } from '../serverlessFunctions/calculaterollups/src/index';

type Json = Record<string, unknown>;

interface RequestLogEntry {
  url: string;
  method: string;
  body?: unknown;
}

const now = new Date();
const currentYear = now.getUTCFullYear();
const previousYear = currentYear - 1;

const mockOpportunities = [
  {
    id: 'opp-1',
    companyId: 'company-1',
    amount: { amountMicros: 150_000_000, currencyCode: 'USD' },
    stage: 'CUSTOMER',
    closeDate: `${currentYear}-01-10T12:00:00.000Z`,
  },
  {
    id: 'opp-2',
    companyId: 'company-1',
    amount: { amountMicros: 90_000_000, currencyCode: 'USD' },
    stage: 'PROPOSAL',
    closeDate: `${currentYear}-03-05T18:00:00.000Z`,
  },
  {
    id: 'opp-3',
    companyId: 'company-1',
    amount: { amountMicros: 60_000_000, currencyCode: 'USD' },
    stage: 'SCREENING',
    closeDate: `${previousYear}-12-15T09:00:00.000Z`,
  },
];

const requestLog: RequestLogEntry[] = [];
const updatePayloads: Array<{ id: string; payload: Json }> = [];

const jsonResponse = (data: Json | Json[]) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

global.fetch = async (
  rawUrl: any,
  init?: { method?: string; body?: unknown },
): Promise<any> => {
  const url = typeof rawUrl === 'string' ? new URL(rawUrl) : rawUrl;
  const method = (init?.method ?? 'GET').toUpperCase();
  requestLog.push({
    url: url.toString(),
    method,
    body: init?.body ? safeParse(init.body) : undefined,
  });

  if (url.pathname.endsWith('/opportunities') && method === 'GET') {
    const companyId = url.searchParams.get('filter[companyId]');
    const items = companyId
      ? mockOpportunities.filter(
          (opportunity) => opportunity.companyId === companyId,
        )
      : mockOpportunities;
    return jsonResponse({
      data: {
        opportunities: items,
      },
      pageInfo: {
        hasNextPage: false,
      },
    });
  }

  if (url.pathname.includes('/companies/') && method === 'PATCH') {
    const id = url.pathname.split('/').pop() ?? 'unknown';
    const payload = safeParse(init?.body) ?? {};
    updatePayloads.push({ id, payload });
    return jsonResponse({ data: { companies: [{ id, ...payload }] } });
  }

  throw new Error(
    `Unhandled request in mock fetch: ${method} ${url.toString()}`,
  );
};

const safeParse = (body: unknown) => {
  if (!body) {
    return undefined;
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Json;
    } catch (error) {
      console.warn('Failed to parse request body', error);
      return undefined;
    }
  }
  return undefined;
};

const main = async () => {
  process.env.TWENTY_API_KEY = 'mock-api-key';
  process.env.TWENTY_API_BASE_URL = 'https://mock.twenty/api';

  const params = {
    trigger: { type: 'databaseEvent' },
    record: { companyId: 'company-1' },
    opportunity: { companyId: 'company-1' },
  };

  const result = await runRollups(params);

  assert.equal(result.status, 'ok', 'rollup execution should succeed');

  const expectedPayload = {
    totalPipelineAmount: { amountMicros: 300_000_000, currencyCode: 'USD' },
    totalOpportunityCount: 3,
    wonPipelineAmount: { amountMicros: 150_000_000, currencyCode: 'USD' },
    wonOpportunityCount: 1,
    openPipelineAmount: { amountMicros: 150_000_000, currencyCode: 'USD' },
    openOpportunityCount: 2,
    lastOpportunityCloseDate: `${currentYear.toString().padStart(4, '0')}-03-05`,
  };

  const companyUpdate = updatePayloads.find(
    (payload) => payload.id === 'company-1',
  );
  assert(companyUpdate, 'expected a PATCH payload for company-1');
  assert.deepStrictEqual(companyUpdate.payload, expectedPayload);

  const opportunitiesRequest = requestLog.find(
    (entry) => entry.method === 'GET' && entry.url.includes('/opportunities'),
  );
  assert(
    opportunitiesRequest,
    'expected at least one GET request for /opportunities',
  );
  const filterParams = new URL(opportunitiesRequest.url).searchParams.getAll(
    'filter',
  );
  assert.deepStrictEqual(
    filterParams,
    ['companyId[eq]:"company-1"'],
    'expected opportunity filter to use the new syntax',
  );

  console.log('--- Rollup execution summary ---');
  console.dir(result, { depth: null });

  console.log('\n--- PATCH payloads sent to companies ---');
  console.dir(updatePayloads, { depth: null });

  console.log('\n--- Requests made ---');
  console.dir(requestLog, { depth: null });
};

main().catch((error) => {
  console.error('Smoke test failed', error);
  process.exitCode = 1;
});
