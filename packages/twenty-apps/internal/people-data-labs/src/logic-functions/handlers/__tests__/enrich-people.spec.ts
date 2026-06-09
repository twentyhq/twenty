import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { enrichPeopleCore } from 'src/logic-functions/handlers/enrich-people';
import { enrichPersonCore } from 'src/logic-functions/handlers/enrich-person';
import { type EnrichResult } from 'src/types/enrich-result';

vi.mock('src/logic-functions/handlers/enrich-person', () => ({
  enrichPersonCore: vi.fn(),
}));

const enrichPersonCoreMock = vi.mocked(enrichPersonCore);

beforeEach(() => {
  enrichPersonCoreMock.mockReset();
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

describe('enrichPeopleCore', () => {
  it('enriches every selected record with a shared client and aggregates', async () => {
    enrichPersonCoreMock.mockImplementation(matchedImplementation);

    const client = createCoreApiClientMock();

    const result = await enrichPeopleCore({
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

  it('accepts a single record instead of an array', async () => {
    enrichPersonCoreMock.mockImplementation(matchedImplementation);

    const client = createCoreApiClientMock();

    const result = await enrichPeopleCore({
      input: { records: { id: 'p1' } },
      client,
    });

    expect(enrichPersonCoreMock).toHaveBeenCalledTimes(1);
    expect(enrichPersonCoreMock).toHaveBeenCalledWith(
      expect.objectContaining({ recordId: 'p1' }),
      client,
    );
    expect(result.total).toBe(1);
    expect(result.matched).toBe(1);
  });
});
