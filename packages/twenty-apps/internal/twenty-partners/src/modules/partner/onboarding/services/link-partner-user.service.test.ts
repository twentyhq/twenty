import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { linkPartnerUser } from './link-partner-user.service';

describe('linkPartnerUser', () => {
  const query = vi.fn();
  const mutation = vi.fn();
  const client = { query, mutation } as unknown as CoreApiClient;

  // Route each read by the shape of its selection: the cascade query asks for `applications`,
  // getCompanyPartnerUser for `company`, getPartnerOwner for `partner` only.
  const routeQueries = (opts: {
    cascade: Record<string, unknown>;
    companyOwner?: string | null;
    ownerRecheck?: string | null;
  }) => {
    query.mockImplementation((q: Record<string, unknown>) => {
      if ('applications' in q) return Promise.resolve(opts.cascade);
      if ('company' in q) return Promise.resolve({ company: { id: 'company-1', partnerUserId: opts.companyOwner ?? null } });
      if ('partner' in q) return Promise.resolve({ partner: { id: 'partner-1', partnerUserId: opts.ownerRecheck ?? null } });
      return Promise.resolve({});
    });
  };

  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
    mutation.mockResolvedValue({});
  });

  it('stamps the partner and cascades to persons, company, applications, links, services and content', async () => {
    routeQueries({
      cascade: {
        partner: {
          id: 'partner-1',
          companyId: 'company-1',
          partnerUserId: null,
          persons: { edges: [{ node: { id: 'person-1', partnerUserId: null } }, { node: { id: 'person-2', partnerUserId: null } }] },
        },
        applications: { edges: [{ node: { id: 'app-1' } }] },
        partnerLinks: { edges: [{ node: { id: 'link-1' } }] },
        partnerServices: { edges: [{ node: { id: 'service-1' } }] },
        partnerContents: { edges: [{ node: { id: 'content-1' } }] },
      },
    });

    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });

    expect(result).toEqual({ linked: true, partnerId: 'partner-1' });
    // 2 persons + 1 application + 1 link + 1 service + 1 content + 1 company + 1 partner = 8
    expect(mutation).toHaveBeenCalledTimes(8);
    // verify every cascade write carries the right id + memberId (not just the count)
    expect(mutation).toHaveBeenCalledWith({ updatePerson: { __args: { id: 'person-1', data: { partnerUserId: 'member-1' } }, id: true } });
    expect(mutation).toHaveBeenCalledWith({ updatePerson: { __args: { id: 'person-2', data: { partnerUserId: 'member-1' } }, id: true } });
    expect(mutation).toHaveBeenCalledWith({ updateApplication: { __args: { id: 'app-1', data: { partnerUserId: 'member-1' } }, id: true } });
    expect(mutation).toHaveBeenCalledWith({ updateCompany: { __args: { id: 'company-1', data: { partnerUserId: 'member-1' } }, id: true } });
    expect(mutation).toHaveBeenCalledWith({ updatePartnerLink: { __args: { id: 'link-1', data: { partnerUserId: 'member-1' } }, id: true } });
    expect(mutation).toHaveBeenCalledWith({ updatePartnerService: { __args: { id: 'service-1', data: { partnerUserId: 'member-1' } }, id: true } });
    expect(mutation).toHaveBeenCalledWith({ updatePartnerContent: { __args: { id: 'content-1', data: { partnerUserId: 'member-1' } }, id: true } });
    expect(mutation).toHaveBeenCalledWith({
      updatePartner: {
        __args: { id: 'partner-1', data: { partnerUserId: 'member-1', partnerUserLinkedAt: expect.any(String) } },
        id: true,
      },
    });
  });

  it('skips persons already linked to a member', async () => {
    routeQueries({
      cascade: {
        partner: {
          id: 'partner-1',
          companyId: null,
          partnerUserId: null,
          persons: { edges: [{ node: { id: 'person-1', partnerUserId: 'member-7' } }, { node: { id: 'person-2', partnerUserId: null } }] },
        },
        applications: { edges: [] },
        partnerLinks: { edges: [] },
        partnerServices: { edges: [] },
        partnerContents: { edges: [] },
      },
    });

    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });

    expect(result).toEqual({ linked: true, partnerId: 'partner-1' });
    // only the unlinked person-2 + the partner get stamped; person-1 is left alone
    expect(mutation).toHaveBeenCalledWith({ updatePerson: { __args: { id: 'person-2', data: { partnerUserId: 'member-1' } }, id: true } });
    expect(mutation).not.toHaveBeenCalledWith(expect.objectContaining({ updatePerson: expect.objectContaining({ __args: expect.objectContaining({ id: 'person-1' }) }) }));
  });

  it('does not steal a company already owned by a different member', async () => {
    routeQueries({
      companyOwner: 'member-9', // company belongs to another partner's member
      cascade: {
        partner: { id: 'partner-1', companyId: 'company-1', partnerUserId: null, persons: { edges: [{ node: { id: 'person-1', partnerUserId: null } }] } },
        applications: { edges: [] },
        partnerLinks: { edges: [] },
        partnerServices: { edges: [] },
        partnerContents: { edges: [] },
      },
    });

    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });

    expect(result).toEqual({ linked: true, partnerId: 'partner-1' });
    // person + partner are stamped, but the shared company is left untouched
    expect(mutation).not.toHaveBeenCalledWith(expect.objectContaining({ updateCompany: expect.anything() }));
    expect(mutation).toHaveBeenCalledWith(expect.objectContaining({ updatePartner: expect.anything() }));
  });

  it('aborts before stamping when another member claimed the partner during the cascade', async () => {
    routeQueries({
      ownerRecheck: 'member-9', // a concurrent onboarding won the claim between read and stamp
      cascade: {
        partner: { id: 'partner-1', companyId: null, partnerUserId: null, persons: { edges: [{ node: { id: 'person-1', partnerUserId: null } }] } },
        applications: { edges: [] },
        partnerLinks: { edges: [] },
        partnerServices: { edges: [] },
        partnerContents: { edges: [] },
      },
    });

    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });

    expect(result).toEqual({ linked: false, reason: 'partner_already_linked_other' });
    // the partner is never stamped by this loser
    expect(mutation).not.toHaveBeenCalledWith(expect.objectContaining({ updatePartner: expect.anything() }));
  });

  it('no-ops when the partner is already linked to the same member', async () => {
    routeQueries({
      cascade: {
        partner: { id: 'partner-1', companyId: null, partnerUserId: 'member-1', persons: { edges: [] } },
        applications: { edges: [] },
      },
    });
    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });
    expect(result).toEqual({ linked: false, reason: 'already_linked_same' });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('reports partner_already_linked_other when claimed by a different member', async () => {
    routeQueries({
      cascade: {
        partner: { id: 'partner-1', companyId: null, partnerUserId: 'member-9', persons: { edges: [] } },
        applications: { edges: [] },
      },
    });
    const result = await linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' });
    expect(result).toEqual({ linked: false, reason: 'partner_already_linked_other' });
    expect(mutation).not.toHaveBeenCalled();
  });

  it('throws when a cascade write fails (retry semantics)', async () => {
    routeQueries({
      cascade: {
        partner: { id: 'partner-1', companyId: null, partnerUserId: null, persons: { edges: [{ node: { id: 'person-1', partnerUserId: null } }] } },
        applications: { edges: [] },
        partnerLinks: { edges: [] },
        partnerServices: { edges: [] },
        partnerContents: { edges: [] },
      },
    });
    mutation.mockRejectedValueOnce(new Error('boom')); // person stamp fails, before the partner is ever touched
    await expect(linkPartnerUser(client, { partnerId: 'partner-1', memberId: 'member-1' })).rejects.toThrow(/cascade write/);
    expect(mutation).not.toHaveBeenCalledWith(expect.objectContaining({ updatePartner: expect.anything() }));
  });
});
