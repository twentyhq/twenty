import { beforeEach, describe, expect, it, vi } from 'vitest';

import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { PdlRecordNotFoundError } from 'src/logic-functions/errors/pdl-record-not-found-error';
import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company';
import { enrichCompany } from 'src/logic-functions/utils/enrich-company';
import { type CompanyNode } from 'src/types/company-node';

vi.mock('src/logic-functions/utils/enrich-company', () => ({ enrichCompany: vi.fn() }));

const enrichCompanyMock = vi.mocked(enrichCompany);

type Captured = { data?: Record<string, unknown> };

type MutationRequest = {
  updateCompany: { __args: { data: Record<string, unknown> } };
};

const buildClient = (node: CompanyNode, captured: Captured) =>
  createCoreApiClientMock({
    queryResult: { companies: { edges: [{ node }] } },
    onMutation: (request) => {
      captured.data = (request as MutationRequest).updateCompany.__args.data;
    },
  });

beforeEach(() => {
  enrichCompanyMock.mockReset();
});

describe('enrichCompanyCore', () => {
  it('fills empty standard fields and writes pdl metadata on a match', async () => {
    enrichCompanyMock.mockResolvedValue({
      outcome: 'matched',
      httpStatus: 200,
      data: {
        id: 'pdlc',
        display_name: 'Acme Corp',
        website: 'newsite.com',
        industry: 'accounting',
      },
    });
    const captured: Captured = {};
    const client = buildClient(COMPANY_NODE_MOCK, captured);

    const result = await enrichCompanyCore({ recordId: 'c1' }, client);

    expect(result.status).toBe('MATCHED');
    expect(captured.data?.name).toBe('Acme Corp');
    expect(captured.data?.pdlIndustry).toBe('ACCOUNTING');
    expect(captured.data?.pdlEnrichmentStatus).toBe('MATCHED');
    expect(typeof captured.data?.pdlLastEnrichedAt).toBe('string');
    expect('domainName' in (captured.data ?? {})).toBe(false);
    expect('pdlLikelihood' in (captured.data ?? {})).toBe(false);
  });

  it('records NOT_FOUND without writing field data', async () => {
    enrichCompanyMock.mockResolvedValue({ outcome: 'not_found', httpStatus: 404 });
    const captured: Captured = {};
    const client = buildClient(COMPANY_NODE_MOCK, captured);

    const result = await enrichCompanyCore({ recordId: 'c1' }, client);

    expect(result.status).toBe('NOT_FOUND');
    expect(Object.keys(captured.data ?? {}).sort()).toEqual([
      'pdlEnrichmentStatus',
      'pdlLastEnrichedAt',
    ]);
  });

  it('records ERROR and reports failure on a PDL error', async () => {
    enrichCompanyMock.mockResolvedValue({
      outcome: 'error',
      httpStatus: 500,
      message: 'boom',
    });
    const captured: Captured = {};
    const client = buildClient(COMPANY_NODE_MOCK, captured);

    const result = await enrichCompanyCore({ recordId: 'c1' }, client);

    expect(result.success).toBe(false);
    expect(result.status).toBe('ERROR');
    expect(result.error).toBe('boom');
    expect(captured.data?.pdlEnrichmentStatus).toBe('ERROR');
    expect(Object.keys(captured.data ?? {})).toEqual(['pdlEnrichmentStatus']);
  });

  it('throws a PdlInvalidInputError when recordId is missing', async () => {
    const promise = enrichCompanyCore({ recordId: '' }, createCoreApiClientMock());

    await expect(promise).rejects.toBeInstanceOf(PdlInvalidInputError);
    await expect(promise).rejects.toThrow('recordId is required');
    expect(enrichCompanyMock).not.toHaveBeenCalled();
  });

  it('throws a PdlRecordNotFoundError when the company does not exist', async () => {
    const client = createCoreApiClientMock({
      queryResult: { companies: { edges: [] } },
    });

    const promise = enrichCompanyCore({ recordId: 'missing' }, client);

    await expect(promise).rejects.toBeInstanceOf(PdlRecordNotFoundError);
    await expect(promise).rejects.toThrow('Company missing not found');
    expect(enrichCompanyMock).not.toHaveBeenCalled();
  });

  it('skips when there is no usable identifier', async () => {
    const captured: Captured = {};
    const client = buildClient(
      { ...COMPANY_NODE_MOCK, domainName: null, name: '' },
      captured,
    );

    const result = await enrichCompanyCore({ recordId: 'c1' }, client);

    expect(result.status).toBe('SKIPPED');
    expect(enrichCompanyMock).not.toHaveBeenCalled();
  });
});
