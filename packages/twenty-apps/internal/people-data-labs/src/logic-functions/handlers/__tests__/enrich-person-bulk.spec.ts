import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { enrichPersonBulkCore } from 'src/logic-functions/handlers/enrich-person-bulk';
import { enrichPersonCore } from 'src/logic-functions/handlers/enrich-person';
import { type EnrichResult } from 'src/types/enrich-result';

vi.mock('src/logic-functions/handlers/enrich-person', () => ({
  enrichPersonCore: vi.fn(),
}));

const enrichPersonCoreMock = vi.mocked(enrichPersonCore);

beforeEach(() => {
  enrichPersonCoreMock.mockReset();
});

describe('enrichPersonBulkCore', () => {
  it('enriches every selected record with a shared client and aggregates', async () => {
    enrichPersonCoreMock.mockImplementation(
      async (input): Promise<EnrichResult> => ({
        success: true,
        recordId: input.recordId,
        status: 'MATCHED',
        updatedFields: [],
        message: 'Enriched.',
      }),
    );

    const client = createCoreApiClientMock();

    const result = await enrichPersonBulkCore({
      input: { records: [{ id: 'p1' }, { id: 'p2' }], force: true },
      client,
    });

    expect(enrichPersonCoreMock).toHaveBeenCalledTimes(2);
    expect(enrichPersonCoreMock).toHaveBeenCalledWith(
      expect.objectContaining({ recordId: 'p1', force: true }),
      client,
    );
    expect(result.total).toBe(2);
    expect(result.matched).toBe(2);
    expect(result.success).toBe(true);
  });
});
