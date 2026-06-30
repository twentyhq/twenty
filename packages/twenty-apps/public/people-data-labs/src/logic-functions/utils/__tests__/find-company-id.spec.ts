import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { findCompanyId } from 'src/logic-functions/utils/find-company-id';

type CompanyQueryRequest = {
  companies: { __args: { filter: Record<string, unknown> } };
};

const filterKeyOf = (request: unknown) =>
  Object.keys((request as CompanyQueryRequest).companies.__args.filter)[0];

const ALL_KEYS = {
  pdlId: 'pdl-co-1',
  website: 'acme.com',
  linkedinUrl: 'https://linkedin.com/company/acme',
  name: 'Acme',
};

describe('findCompanyId', () => {
  it('matches by pdlId first and does not query the lower-priority keys', async () => {
    const query = vi.fn((request: unknown) =>
      Promise.resolve(
        filterKeyOf(request) === 'pdlId'
          ? { companies: { edges: [{ node: { id: 'co-pdl' } }] } }
          : { companies: { edges: [] } },
      ),
    );
    const client = { query } as unknown as CoreApiClient;

    const result = await findCompanyId({ client, matchKeys: ALL_KEYS });

    expect(result).toBe('co-pdl');
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('falls through to lower-priority keys in order until one matches', async () => {
    const queriedKeys: string[] = [];
    const query = vi.fn((request: unknown) => {
      const key = filterKeyOf(request);
      queriedKeys.push(key);

      return Promise.resolve(
        key === 'name'
          ? { companies: { edges: [{ node: { id: 'co-name' } }] } }
          : { companies: { edges: [] } },
      );
    });
    const client = { query } as unknown as CoreApiClient;

    const result = await findCompanyId({ client, matchKeys: ALL_KEYS });

    expect(result).toBe('co-name');
    expect(queriedKeys).toEqual([
      'pdlId',
      'domainName',
      'linkedinLink',
      'name',
    ]);
  });

  it('skips filters whose match key is absent', async () => {
    const queriedKeys: string[] = [];
    const query = vi.fn((request: unknown) => {
      queriedKeys.push(filterKeyOf(request));

      return Promise.resolve({ companies: { edges: [] } });
    });
    const client = { query } as unknown as CoreApiClient;

    await findCompanyId({ client, matchKeys: { name: 'Acme' } });

    expect(queriedKeys).toEqual(['name']);
  });

  it('returns undefined when no key matches', async () => {
    const query = vi.fn(() => Promise.resolve({ companies: { edges: [] } }));
    const client = { query } as unknown as CoreApiClient;

    expect(
      await findCompanyId({ client, matchKeys: ALL_KEYS }),
    ).toBeUndefined();
  });

  it('returns undefined and issues no query when no keys are provided', async () => {
    const query = vi.fn();
    const client = { query } as unknown as CoreApiClient;

    expect(await findCompanyId({ client, matchKeys: {} })).toBeUndefined();
    expect(query).not.toHaveBeenCalled();
  });

  it('does not link a name match when it is ambiguous', async () => {
    const query = vi.fn(() =>
      Promise.resolve({
        companies: {
          edges: [{ node: { id: 'co-1' } }, { node: { id: 'co-2' } }],
        },
      }),
    );
    const client = { query } as unknown as CoreApiClient;

    expect(
      await findCompanyId({ client, matchKeys: { name: 'Acme' } }),
    ).toBeUndefined();
  });

  it('links a unique name match', async () => {
    const query = vi.fn(() =>
      Promise.resolve({ companies: { edges: [{ node: { id: 'co-1' } }] } }),
    );
    const client = { query } as unknown as CoreApiClient;

    expect(await findCompanyId({ client, matchKeys: { name: 'Acme' } })).toBe(
      'co-1',
    );
  });
});
