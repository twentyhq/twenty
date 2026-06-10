import { describe, expect, it } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { PERSON_NODE_MOCK } from 'src/logic-functions/__mocks__/person-node.mock';
import { buildPersonMatchedData } from 'src/logic-functions/utils/build-person-matched-data';

const ENRICHED_AT = '2026-01-01T00:00:00.000Z';

describe('buildPersonMatchedData', () => {
  it('fills empty fields, writes pdl metadata, and skips company lookup when there is none', async () => {
    const client = createCoreApiClientMock();

    const data = await buildPersonMatchedData({
      client,
      node: PERSON_NODE_MOCK,
      outcome: {
        likelihood: 8,
        data: {
          id: 'pdl1',
          first_name: 'Jane',
          last_name: 'Doe',
          work_email: 'jane@acme.com',
          job_title: 'CEO',
        },
      },
      enrichedAt: ENRICHED_AT,
      companyIdByMatchKeyCache: new Map(),
      overrideExistingValues: false,
    });

    expect(data.name).toEqual({ firstName: 'Jane', lastName: 'Doe' });
    expect(data.jobTitle).toBe('CEO');
    expect(data.pdlLikelihood).toBe(8);
    expect(data.pdlEnrichmentStatus).toBe('MATCHED');
    expect(data.pdlLastEnrichedAt).toBe(ENRICHED_AT);
    expect('companyId' in data).toBe(false);
  });

  it('overwrites a populated standard field when overrideExistingValues is set', async () => {
    const client = createCoreApiClientMock();

    const data = await buildPersonMatchedData({
      client,
      node: { ...PERSON_NODE_MOCK, jobTitle: 'Existing Title' },
      outcome: { likelihood: 8, data: { id: 'pdl1', job_title: 'CEO' } },
      enrichedAt: ENRICHED_AT,
      companyIdByMatchKeyCache: new Map(),
      overrideExistingValues: true,
    });

    expect(data.jobTitle).toBe('CEO');
  });

  it('links a found-or-created company when the person has none', async () => {
    const client = createCoreApiClientMock({
      queryResult: { companies: { edges: [] } },
      mutationResult: { createCompany: { id: 'co-new' } },
    });

    const data = await buildPersonMatchedData({
      client,
      node: PERSON_NODE_MOCK,
      outcome: {
        likelihood: 8,
        data: {
          id: 'pdl1',
          work_email: 'jane@acme.com',
          job_company_name: 'Acme',
          job_company_website: 'acme.com',
        },
      },
      enrichedAt: ENRICHED_AT,
      companyIdByMatchKeyCache: new Map(),
      overrideExistingValues: false,
    });

    expect(data.companyId).toBe('co-new');
  });
});
