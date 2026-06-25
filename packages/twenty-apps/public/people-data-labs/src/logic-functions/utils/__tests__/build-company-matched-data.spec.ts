import { describe, expect, it } from 'vitest';

import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { PDL_COMPANY_DATA_MOCK } from 'src/logic-functions/__mocks__/pdl-company-data.mock';
import { buildCompanyMatchedData } from 'src/logic-functions/utils/build-company-matched-data';

const ENRICHED_AT = '2026-01-01T00:00:00.000Z';

describe('buildCompanyMatchedData', () => {
  it('fills empty standard fields and always writes pdl metadata', async () => {
    const { mappedData, persistData } = await buildCompanyMatchedData({
      node: COMPANY_NODE_MOCK,
      outcome: { data: PDL_COMPANY_DATA_MOCK },
      enrichedAt: ENRICHED_AT,
      overrideExistingValues: false,
      shouldPersist: true,
    });

    expect(persistData.name).toBe('Acme Corp');
    expect(persistData.pdlIndustry).toBe('ACCOUNTING');
    expect(persistData.pdlEnrichmentStatus).toBe('MATCHED');
    expect(persistData.pdlLastEnrichedAt).toBe(ENRICHED_AT);
    expect('domainName' in persistData).toBe(false);

    expect(mappedData.name).toBe('Acme Corp');
    expect(mappedData.pdlIndustry).toBe('ACCOUNTING');
    expect('pdlEnrichmentStatus' in mappedData).toBe(false);
    expect('pdlRawPayload' in mappedData).toBe(false);
  });

  it('overwrites a populated standard field when overrideExistingValues is set', async () => {
    const { persistData } = await buildCompanyMatchedData({
      node: COMPANY_NODE_MOCK,
      outcome: { data: PDL_COMPANY_DATA_MOCK },
      enrichedAt: ENRICHED_AT,
      overrideExistingValues: true,
      shouldPersist: true,
    });

    expect('domainName' in persistData).toBe(true);
  });

  it('returns mapped data with no persist data when not persisting', async () => {
    const { mappedData, persistData } = await buildCompanyMatchedData({
      node: COMPANY_NODE_MOCK,
      outcome: { data: PDL_COMPANY_DATA_MOCK },
      enrichedAt: ENRICHED_AT,
      overrideExistingValues: false,
      shouldPersist: false,
    });

    expect(mappedData.name).toBe('Acme Corp');
    expect(mappedData.pdlIndustry).toBe('ACCOUNTING');
    expect(persistData).toEqual({});
  });
});
