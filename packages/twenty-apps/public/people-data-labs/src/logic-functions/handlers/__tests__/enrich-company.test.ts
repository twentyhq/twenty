import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company';
import { enrichCompany } from 'src/logic-functions/utils/enrich-company';
import { type CompanyNode } from 'src/types/company-node';

vi.mock('src/logic-functions/utils/enrich-company', () => ({
  enrichCompany: vi.fn(),
}));

const enrichCompanyMock = vi.mocked(enrichCompany);

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
  enrichCompanyCore({ input: { recordId }, client });

beforeEach(() => {
  enrichCompanyMock.mockReset();
});

describe('enrichCompanyCore', () => {
  it('fills empty standard fields and writes pdl metadata via updateCompany on a match', async () => {
    enrichCompanyMock.mockResolvedValue([
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

    expect(enrichCompanyMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('MATCHED');
    expect(result.success).toBe(true);
    expect(result.recordId).toBe('c1');
    expect(result.updatedFields).toContain('name');
    expect(captured.updateCompany?.name).toBe('Acme Corp');
    expect(captured.updateCompany?.pdlIndustry).toBe('ACCOUNTING');
    expect(captured.updateCompany?.pdlEnrichmentStatus).toBe('MATCHED');
  });

  it('records NOT_FOUND and writes the status via updateCompanies', async () => {
    enrichCompanyMock.mockResolvedValue([{ outcome: 'not_found', httpStatus: 404 }]);
    const captured: Captured = {};
    const client = buildClient([COMPANY_NODE_MOCK], captured);

    const result = await runOne(client);

    expect(result.status).toBe('NOT_FOUND');
    expect(result.success).toBe(true);
    expect(captured.updateCompany).toBeUndefined();
    expect(captured.updateCompanies?.data.pdlEnrichmentStatus).toBe('NOT_FOUND');
    expect(captured.updateCompanies?.filter).toEqual({ id: { in: ['c1'] } });
  });

  it('records ERROR and reports failure on a PDL error', async () => {
    enrichCompanyMock.mockResolvedValue([
      { outcome: 'error', httpStatus: 500, message: 'boom' },
    ]);
    const captured: Captured = {};
    const client = buildClient([COMPANY_NODE_MOCK], captured);

    const result = await runOne(client);

    expect(result.status).toBe('ERROR');
    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
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

    expect(result.status).toBe('SKIPPED');
    expect(enrichCompanyMock).not.toHaveBeenCalled();
  });

  it('marks a missing record as ERROR', async () => {
    const captured: Captured = {};
    const client = buildClient([], captured);

    const result = await runOne(client, 'missing');

    expect(result.status).toBe('ERROR');
    expect(result.error).toBe('Company missing not found');
    expect(enrichCompanyMock).not.toHaveBeenCalled();
  });

  it('returns an ERROR without touching PDL when no record id is provided', async () => {
    const captured: Captured = {};
    const client = buildClient([COMPANY_NODE_MOCK], captured);

    const result = await enrichCompanyCore({ input: {}, client });

    expect(result.status).toBe('ERROR');
    expect(result.error).toBe('No record id was provided to enrich.');
    expect(enrichCompanyMock).not.toHaveBeenCalled();
  });
});
