import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { enrichCompaniesCore } from 'src/logic-functions/handlers/enrich-companies';
import { enrichCompanies } from 'src/logic-functions/utils/enrich-companies';
import { type CompanyNode } from 'src/types/company-node';

vi.mock('src/logic-functions/utils/enrich-companies', () => ({
  enrichCompanies: vi.fn(),
}));

const enrichCompaniesMock = vi.mocked(enrichCompanies);

type Captured = {
  updateCompany?: Record<string, unknown>;
  updateCompanies?: { filter: unknown; data: Record<string, unknown> };
};

type MutationRequest = {
  updateCompany?: { __args: { id: string; data: Record<string, unknown> } };
  updateCompanies?: { __args: { filter: unknown; data: Record<string, unknown> } };
};

const captureMutation = (captured: Captured) => (request: unknown) => {
  const mutation = request as MutationRequest;
  if (mutation.updateCompany) {
    captured.updateCompany = mutation.updateCompany.__args.data;
  }
  if (mutation.updateCompanies) {
    captured.updateCompanies = {
      filter: mutation.updateCompanies.__args.filter,
      data: mutation.updateCompanies.__args.data,
    };
  }
};

const buildClient = (companies: CompanyNode[], captured: Captured): CoreApiClient =>
  createCoreApiClientMock({
    queryResult: { companies: { edges: companies.map((node) => ({ node })) } },
    onMutation: captureMutation(captured),
  });

const runOne = (client: CoreApiClient, recordId = 'c1') =>
  enrichCompaniesCore({ input: { records: [{ id: recordId }] }, client });

beforeEach(() => {
  enrichCompaniesMock.mockReset();
});

describe('enrichCompaniesCore', () => {
  it('fills empty standard fields and writes pdl metadata via updateCompany on a match', async () => {
    enrichCompaniesMock.mockResolvedValue([
      {
        outcome: 'matched',
        httpStatus: 200,
        data: {
          id: 'pdlc',
          display_name: 'Acme Corp',
          website: 'newsite.com',
          industry: 'accounting',
        },
      },
    ]);
    const captured: Captured = {};
    const client = buildClient([COMPANY_NODE_MOCK], captured);

    const result = await runOne(client);

    expect(enrichCompaniesMock).toHaveBeenCalledTimes(1);
    expect(result.matched).toBe(1);
    expect(captured.updateCompany?.name).toBe('Acme Corp');
    expect(captured.updateCompany?.pdlIndustry).toBe('ACCOUNTING');
    expect(captured.updateCompany?.pdlEnrichmentStatus).toBe('MATCHED');
    expect(typeof captured.updateCompany?.pdlLastEnrichedAt).toBe('string');
    expect('domainName' in (captured.updateCompany ?? {})).toBe(false);
    expect('pdlLikelihood' in (captured.updateCompany ?? {})).toBe(false);
  });

  it('records NOT_FOUND and writes the status via a batched updateCompanies', async () => {
    enrichCompaniesMock.mockResolvedValue([{ outcome: 'not_found', httpStatus: 404 }]);
    const captured: Captured = {};
    const client = buildClient([COMPANY_NODE_MOCK], captured);

    const result = await runOne(client);

    expect(result.notFound).toBe(1);
    expect(captured.updateCompany).toBeUndefined();
    expect(Object.keys(captured.updateCompanies?.data ?? {}).sort()).toEqual([
      'pdlEnrichmentStatus',
      'pdlLastEnrichedAt',
    ]);
    expect(captured.updateCompanies?.filter).toEqual({ id: { in: ['c1'] } });
  });

  it('records ERROR and reports failure on a PDL error', async () => {
    enrichCompaniesMock.mockResolvedValue([
      { outcome: 'error', httpStatus: 500, message: 'boom' },
    ]);
    const captured: Captured = {};
    const client = buildClient([COMPANY_NODE_MOCK], captured);

    const result = await runOne(client);

    expect(result.errored).toBe(1);
    expect(result.success).toBe(false);
    expect(result.results[0].error).toBe('boom');
    expect(captured.updateCompanies?.data).toEqual({
      pdlEnrichmentStatus: 'ERROR',
      pdlLastEnrichedAt: expect.any(String),
    });
  });

  it('skips when there is no usable identifier', async () => {
    const captured: Captured = {};
    const client = buildClient(
      [{ ...COMPANY_NODE_MOCK, domainName: null, name: '' }],
      captured,
    );

    const result = await runOne(client);

    expect(result.skipped).toBe(1);
    expect(enrichCompaniesMock).not.toHaveBeenCalled();
  });

  it('marks a missing record as ERROR', async () => {
    const captured: Captured = {};
    const client = buildClient([], captured);

    const result = await runOne(client, 'missing');

    expect(result.errored).toBe(1);
    expect(result.results[0].error).toBe('Company missing not found');
    expect(enrichCompaniesMock).not.toHaveBeenCalled();
  });

  it('batches the PDL request and the not-found status write across records', async () => {
    enrichCompaniesMock.mockResolvedValue([
      { outcome: 'not_found', httpStatus: 404 },
      { outcome: 'not_found', httpStatus: 404 },
    ]);
    const captured: Captured = {};
    const client = buildClient(
      [COMPANY_NODE_MOCK, { ...COMPANY_NODE_MOCK, id: 'c2' }],
      captured,
    );

    const result = await enrichCompaniesCore({
      input: { records: [{ id: 'c1' }, { id: 'c2' }] },
      client,
    });

    expect(enrichCompaniesMock).toHaveBeenCalledTimes(1);
    expect(captured.updateCompanies?.filter).toEqual({ id: { in: ['c1', 'c2'] } });
    expect(result.notFound).toBe(2);
  });
});
