import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { enrichCompaniesCore } from 'src/logic-functions/handlers/enrich-companies';
import { enrichCompanyCore } from 'src/logic-functions/handlers/enrich-company';
import { type EnrichResult } from 'src/types/enrich-result';

vi.mock('src/logic-functions/handlers/enrich-company', () => ({
  enrichCompanyCore: vi.fn(),
}));

const enrichCompanyCoreMock = vi.mocked(enrichCompanyCore);

beforeEach(() => {
  enrichCompanyCoreMock.mockReset();
});

const matchedImplementation = async (input: {
  recordId: string;
}): Promise<EnrichResult> => ({
  success: true,
  recordId: input.recordId,
  status: 'MATCHED',
  updatedFields: [],
  message: 'Enriched.',
});

describe('enrichCompaniesCore', () => {
  it('enriches every selected record with a shared client and aggregates', async () => {
    enrichCompanyCoreMock.mockImplementation(matchedImplementation);

    const client = createCoreApiClientMock();

    const result = await enrichCompaniesCore({
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

  it('accepts a single record instead of an array', async () => {
    enrichCompanyCoreMock.mockImplementation(matchedImplementation);

    const client = createCoreApiClientMock();

    const result = await enrichCompaniesCore({
      input: { records: { id: 'c1' } },
      client,
    });

    expect(enrichCompanyCoreMock).toHaveBeenCalledTimes(1);
    expect(enrichCompanyCoreMock).toHaveBeenCalledWith(
      expect.objectContaining({ recordId: 'c1' }),
      client,
    );
    expect(result.total).toBe(1);
    expect(result.matched).toBe(1);
  });
});
