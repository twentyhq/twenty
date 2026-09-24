import { afterEach, describe, expect, it, vi } from 'vitest';

import { UPDATE_FIELDS_OPTIONS } from 'src/constants/update-fields-options';
import { COMPANY_NODE_MOCK } from 'src/logic-functions/__mocks__/company-node.mock';
import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { companySingleEnrichmentAdapter } from 'src/logic-functions/handlers/company-single-enrichment-adapter';
import { enrichCompany } from 'src/logic-functions/utils/enrich-company';
import { runSingleEnrichment } from 'src/logic-functions/utils/run-single-enrichment';

vi.mock('src/logic-functions/utils/enrich-company', () => ({
  enrichCompany: vi.fn(),
}));

describe('runSingleEnrichment', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('uses both workflow overrides for a single name-based match', async () => {
    vi.stubEnv('PDL_COMPANY_MIN_LIKELIHOOD', '8');
    vi.stubEnv('PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD', '10');
    vi.mocked(enrichCompany).mockResolvedValue([
      { outcome: 'not_found', httpStatus: 404 },
    ]);

    const client = createCoreApiClientMock({
      queryResult: {
        companies: {
          edges: [
            { node: { ...COMPANY_NODE_MOCK, domainName: null, name: 'Acme' } },
          ],
        },
      },
    });

    const result = await runSingleEnrichment({
      client,
      input: {
        recordId: 'c1',
        updateFields: UPDATE_FIELDS_OPTIONS.no,
        minLikelihood: 3,
        weakIdentifierMinLikelihood: 4,
      },
      adapter: companySingleEnrichmentAdapter,
    });

    expect(enrichCompany).toHaveBeenCalledExactlyOnceWith([
      { name: 'Acme', minLikelihood: 4 },
    ]);
    expect(result).toMatchObject({ recordId: 'c1', status: 'NOT_FOUND' });
  });
});
