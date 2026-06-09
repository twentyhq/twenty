import { describe, expect, it } from 'vitest';

import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { PDL_COMPANY_DATA_MOCK } from 'src/logic-functions/__mocks__/pdl-company-data.mock';
import { buildCompanyMatchedData } from 'src/logic-functions/utils/build-company-matched-data';

const ENRICHED_AT = '2026-01-01T00:00:00.000Z';

describe('buildCompanyMatchedData', () => {
  it('fills empty standard fields and always writes pdl metadata', async () => {
    const data = await buildCompanyMatchedData({
      node: COMPANY_NODE_MOCK,
      outcome: { data: PDL_COMPANY_DATA_MOCK },
      enrichedAt: ENRICHED_AT,
    });

    expect(data.name).toBe('Acme Corp');
    expect(data.pdlIndustry).toBe('ACCOUNTING');
    expect(data.pdlEnrichmentStatus).toBe('MATCHED');
    expect(data.pdlLastEnrichedAt).toBe(ENRICHED_AT);
    expect('domainName' in data).toBe(false);
  });
});
