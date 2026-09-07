import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { propagatePartnerUser } from './propagate-partner-user.service';

describe('propagatePartnerUser absence branches', () => {
  const query = vi.fn();
  const mutation = vi.fn();
  const client = { query, mutation } as unknown as CoreApiClient;

  // Route each read by the shape of its selection, the way the other service tests do.
  const routeQueries = (overrides: Record<string, unknown> = {}) => {
    query.mockImplementation((selection: Record<string, unknown>) => {
      const key = Object.keys(selection)[0] as string;
      if (key in overrides) return Promise.resolve({ [key]: overrides[key] });
      if (key === 'people') return Promise.resolve({ people: { edges: [] } });
      return Promise.resolve({ [key]: { edges: [] } });
    });
  };

  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
    mutation.mockResolvedValue({});
    routeQueries();
  });

  it('clears the opportunity when the cascade read finds no opportunity row', async () => {
    const result = await propagatePartnerUser(client, {
      opportunityId: 'opportunity-1',
      before: { partnerId: 'partner-1' } as never,
      after: {} as never,
    });

    expect(result).toEqual({ cascaded: true, cleared: true });
    expect(mutation).toHaveBeenCalledWith({
      updateOpportunity: {
        __args: { id: 'opportunity-1', data: { partnerUserId: null } },
        id: true,
      },
    });
  });

  it('reports partner_has_no_user when the partner row is absent', async () => {
    const result = await propagatePartnerUser(client, {
      opportunityId: 'opportunity-1',
      before: {} as never,
      after: { partnerId: 'partner-1' } as never,
    });

    expect(result).toEqual({ cascaded: false, reason: 'partner_has_no_user' });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('stamps the company when the company row is absent', async () => {
    routeQueries({
      partners: { edges: [{ node: { id: 'partner-1', partnerUserId: 'member-1' } }] },
      companies: { edges: [] },
    });

    const result = await propagatePartnerUser(client, {
      opportunityId: 'opportunity-1',
      before: {} as never,
      after: { partnerId: 'partner-1', companyId: 'company-1' } as never,
    });

    expect(result).toEqual({ cascaded: true, partnerUserId: 'member-1' });
    expect(mutation).toHaveBeenCalledWith({
      updateCompany: {
        __args: { id: 'company-1', data: { partnerUserId: 'member-1' } },
        id: true,
      },
    });
  });
});
