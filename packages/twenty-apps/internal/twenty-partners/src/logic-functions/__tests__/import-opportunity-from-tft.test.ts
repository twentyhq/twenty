import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the codegen client BEFORE importing the handler. vi.hoisted lets the
// factory reference the mocks safely despite hoisting.
const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryMock;
    mutation = mutationMock;
  },
}));

import {
  handler,
  type ImportOpportunityFromTftInput,
} from '../import-opportunity-from-tft.logic-function';

const SECRET = 'test-secret-abc123';

const baseInput = (
  overrides: Partial<ImportOpportunityFromTftInput> = {},
): ImportOpportunityFromTftInput => ({
  tftOpportunityId: 'tft-opp-1',
  name: 'Acme rollout',
  amountMicros: 5000000,
  currencyCode: 'EUR',
  closeDate: '2026-07-01T00:00:00.000Z',
  stage: 'MEETING',
  company: { name: 'Acme', domain: 'acme.com' },
  pointOfContact: { email: 'ada@acme.com', firstName: 'Ada', lastName: 'Lovelace' },
  ...overrides,
});

const authedEvent = (input: ImportOpportunityFromTftInput) => ({
  body: input,
  headers: { 'x-application-secret': SECRET },
});

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  process.env.PARTNER_APPLICATION_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.PARTNER_APPLICATION_SECRET;
});

describe('import-opportunity-from-tft handler', () => {
  it('rejects a wrong/missing secret without touching the client', async () => {
    const result = await handler({ body: baseInput(), headers: {} });
    expect(result).toEqual({ ok: false, reason: 'unauthorized' });
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('is idempotent: an existing tftOpportunityId returns created:false and creates nothing', async () => {
    queryMock.mockResolvedValueOnce({
      opportunities: { edges: [{ node: { id: 'existing-opp' } }] },
    });

    const result = await handler(authedEvent(baseInput()));

    expect(result).toEqual({ ok: true, created: false, id: 'existing-opp' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('creates the opportunity with mapped fields + resolved company/contact', async () => {
    queryMock
      .mockResolvedValueOnce({ opportunities: { edges: [] } }) // dedup miss
      .mockResolvedValueOnce({ companies: { edges: [] } }) // company miss
      .mockResolvedValueOnce({ people: { edges: [] } }); // contact miss
    mutationMock
      .mockResolvedValueOnce({ createCompany: { id: 'company-1' } })
      .mockResolvedValueOnce({ createPerson: { id: 'person-1' } })
      .mockResolvedValueOnce({ createOpportunity: { id: 'opp-1' } });

    const result = await handler(
      authedEvent(baseInput({ useCase: 'Migrate from HubSpot, ~30 sales users' })),
    );

    expect(result).toEqual({ ok: true, created: true, id: 'opp-1' });

    const createOppCall = mutationMock.mock.calls.find(
      ([arg]) => 'createOpportunity' in arg,
    );
    expect(createOppCall?.[0].createOpportunity.__args.data).toEqual({
      name: 'Acme rollout',
      tftOpportunityId: 'tft-opp-1',
      amount: { amountMicros: 5000000, currencyCode: 'EUR' },
      closeDate: '2026-07-01T00:00:00.000Z',
      stage: 'MEETING',
      need: 'Migrate from HubSpot, ~30 sales users',
      companyId: 'company-1',
      pointOfContactId: 'person-1',
    });
  });

  it('drops null amountMicros/closeDate instead of failing validation', async () => {
    queryMock
      .mockResolvedValueOnce({ opportunities: { edges: [] } })
      .mockResolvedValueOnce({ companies: { edges: [] } })
      .mockResolvedValueOnce({ people: { edges: [] } });
    mutationMock
      .mockResolvedValueOnce({ createCompany: { id: 'company-1' } })
      .mockResolvedValueOnce({ createPerson: { id: 'person-1' } })
      .mockResolvedValueOnce({ createOpportunity: { id: 'opp-1' } });

    const body = { ...baseInput(), amountMicros: null, closeDate: null };
    const result = await handler({
      body,
      headers: { 'x-application-secret': SECRET },
    });

    expect(result).toEqual({ ok: true, created: true, id: 'opp-1' });
    const data = mutationMock.mock.calls.find(
      ([arg]) => 'createOpportunity' in arg,
    )?.[0].createOpportunity.__args.data;
    expect(data).not.toHaveProperty('amount');
    expect(data).not.toHaveProperty('closeDate');
  });

  it('drops null useCase instead of failing validation', async () => {
    queryMock
      .mockResolvedValueOnce({ opportunities: { edges: [] } })
      .mockResolvedValueOnce({ companies: { edges: [] } })
      .mockResolvedValueOnce({ people: { edges: [] } });
    mutationMock
      .mockResolvedValueOnce({ createCompany: { id: 'company-1' } })
      .mockResolvedValueOnce({ createPerson: { id: 'person-1' } })
      .mockResolvedValueOnce({ createOpportunity: { id: 'opp-1' } });

    const body = { ...baseInput(), useCase: null };
    const result = await handler({
      body,
      headers: { 'x-application-secret': SECRET },
    });

    expect(result).toEqual({ ok: true, created: true, id: 'opp-1' });
    const data = mutationMock.mock.calls.find(
      ([arg]) => 'createOpportunity' in arg,
    )?.[0].createOpportunity.__args.data;
    expect(data).not.toHaveProperty('need');
    expect(data).not.toHaveProperty('useCase');
  });
});
