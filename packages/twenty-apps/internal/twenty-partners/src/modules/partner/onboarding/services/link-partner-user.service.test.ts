import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { linkPartnerUser } from './link-partner-user.service';

describe('linkPartnerUser', () => {
  const query = vi.fn();
  const mutation = vi.fn();
  const client = { query, mutation } as unknown as CoreApiClient;

  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
    mutation.mockResolvedValue({});
  });

  it('stamps the partner and cascades to persons, company and applications', async () => {
    query.mockResolvedValueOnce({
      partner: {
        id: 'partner-1',
        companyId: 'company-1',
        partnerUserId: null,
        persons: { edges: [{ node: { id: 'person-1' } }, { node: { id: 'person-2' } }] },
      },
      applications: { edges: [{ node: { id: 'app-1' } }] },
    });

    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });

    expect(result).toEqual({ linked: true, partnerId: 'partner-1' });
    // partner + 2 persons + 1 company + 1 application = 5 mutations
    expect(mutation).toHaveBeenCalledTimes(5);
    expect(mutation).toHaveBeenCalledWith({
      updatePartner: {
        __args: { id: 'partner-1', data: { partnerUserId: 'member-1', partnerUserLinkedAt: expect.any(String) } },
        id: true,
      },
    });
  });

  it('no-ops when the partner is already linked to the same member', async () => {
    query.mockResolvedValueOnce({
      partner: { id: 'partner-1', companyId: null, partnerUserId: 'member-1', persons: { edges: [] } },
      applications: { edges: [] },
    });
    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });
    expect(result).toEqual({ linked: false, reason: 'already_linked_same' });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('reports partner_already_linked_other when claimed by a different member', async () => {
    query.mockResolvedValueOnce({
      partner: { id: 'partner-1', companyId: null, partnerUserId: 'member-9', persons: { edges: [] } },
      applications: { edges: [] },
    });
    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });
    expect(result).toEqual({ linked: false, reason: 'partner_already_linked_other' });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('throws when a cascade write fails (retry semantics)', async () => {
    query.mockResolvedValueOnce({
      partner: { id: 'partner-1', companyId: null, partnerUserId: null, persons: { edges: [{ node: { id: 'person-1' } }] } },
      applications: { edges: [] },
    });
    mutation.mockRejectedValueOnce(new Error('boom')); // person stamp fails, before the partner is ever touched
    await expect(linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' })).rejects.toThrow(/cascade write/);
    expect(mutation).not.toHaveBeenCalledWith(expect.objectContaining({ updatePartner: expect.anything() }));
  });
});
