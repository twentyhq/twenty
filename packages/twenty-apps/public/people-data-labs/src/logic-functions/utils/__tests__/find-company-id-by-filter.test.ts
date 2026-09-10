import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { findCompanyIdByFilter } from 'src/logic-functions/utils/find-company-id-by-filter';

describe('findCompanyIdByFilter', () => {
  it('returns the first matching company id and forwards the filter', async () => {
    const query = vi.fn(() =>
      Promise.resolve({ companies: { edges: [{ node: { id: 'co-1' } }] } }),
    );
    const client = { query } as unknown as CoreApiClient;
    const filter = { pdlId: { eq: 'pdl-co-1' } };

    const result = await findCompanyIdByFilter({ client, filter });

    expect(result).toBe('co-1');
    expect(query).toHaveBeenCalledWith({
      companies: {
        __args: { filter, first: 1 },
        edges: { node: { id: true } },
      },
    });
  });

  it('returns undefined when there are no matches', async () => {
    const query = vi.fn(() => Promise.resolve({ companies: { edges: [] } }));
    const client = { query } as unknown as CoreApiClient;

    expect(
      await findCompanyIdByFilter({ client, filter: { name: { eq: 'Acme' } } }),
    ).toBeUndefined();
  });

  it('returns undefined when the companies connection is absent', async () => {
    const query = vi.fn(() => Promise.resolve({}));
    const client = { query } as unknown as CoreApiClient;

    expect(
      await findCompanyIdByFilter({ client, filter: { name: { eq: 'Acme' } } }),
    ).toBeUndefined();
  });
});
