import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { enrichCompanyBulkCore } from 'src/logic-functions/handlers/enrich-company-bulk.core';
import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company.core';
import { type EnrichResult } from 'src/types/enrich-result.type';

vi.mock('src/logic-functions/handlers/enrich-company.core', () => ({
  enrichCompanyCore: vi.fn(),
}));

const enrichCompanyCoreMock = vi.mocked(enrichCompanyCore);

beforeEach(() => {
  enrichCompanyCoreMock.mockReset();
});

describe('enrichCompanyBulkCore', () => {
  it('enriches every selected record with a shared client and aggregates', async () => {
    enrichCompanyCoreMock.mockImplementation(
      async (input): Promise<EnrichResult> => ({
        success: true,
        recordId: input.recordId,
        status: 'MATCHED',
        updatedFields: [],
        message: 'Enriched.',
      }),
    );

    const client = createCoreApiClientMock();

    const result = await enrichCompanyBulkCore({
      input: { records: [{ id: 'c1' }, { id: 'c2' }], force: false },
      client,
    });

    expect(enrichCompanyCoreMock).toHaveBeenCalledTimes(2);
    expect(enrichCompanyCoreMock).toHaveBeenCalledWith(
      expect.objectContaining({ recordId: 'c1', force: false }),
      client,
    );
    expect(result.total).toBe(2);
    expect(result.matched).toBe(2);
    expect(result.success).toBe(true);
  });
});
