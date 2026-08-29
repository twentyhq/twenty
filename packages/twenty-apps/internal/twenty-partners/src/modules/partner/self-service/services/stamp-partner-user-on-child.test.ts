import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { stampPartnerUserFromPartner } from './stamp-partner-user-on-child.service';

const oneEdge = (node: Record<string, unknown>) => ({ edges: [{ node }] });
const noEdges = { edges: [] };

describe('stampPartnerUserFromPartner', () => {
  const query = vi.fn();
  const mutation = vi.fn();

  const client = {
    query,
    mutation,
  } as unknown as CoreApiClient;

  beforeEach(() => {
    query.mockReset();
    mutation.mockReset();
    mutation.mockResolvedValue({});
  });

  it('stamps partnerLink partnerUserId when missing', async () => {
    query
      .mockResolvedValueOnce({ partners: oneEdge({ id: 'partner-1', partnerUserId: 'member-1' }) })
      .mockResolvedValueOnce({ partnerLinks: oneEdge({ id: 'link-1', partnerUserId: null }) });

    await stampPartnerUserFromPartner(client, 'partner-1', 'partnerLink', 'link-1');

    expect(mutation).toHaveBeenCalledWith({
      updatePartnerLink: { __args: { id: 'link-1', data: { partnerUserId: 'member-1' } }, id: true },
    });
  });

  it('stamps application partnerUserId when missing', async () => {
    query
      .mockResolvedValueOnce({ partners: oneEdge({ id: 'partner-1', partnerUserId: 'member-1' }) })
      .mockResolvedValueOnce({ applications: oneEdge({ id: 'application-1', partnerUserId: null }) });

    await stampPartnerUserFromPartner(client, 'partner-1', 'application', 'application-1');

    expect(mutation).toHaveBeenCalledWith({
      updateApplication: {
        __args: { id: 'application-1', data: { partnerUserId: 'member-1' } },
        id: true,
      },
    });
  });

  it('stamps partnerService partnerUserId when missing', async () => {
    query
      .mockResolvedValueOnce({ partners: oneEdge({ id: 'partner-1', partnerUserId: 'member-1' }) })
      .mockResolvedValueOnce({ partnerServices: oneEdge({ id: 'service-1', partnerUserId: null }) });

    await stampPartnerUserFromPartner(client, 'partner-1', 'partnerService', 'service-1');

    expect(mutation).toHaveBeenCalledWith({
      updatePartnerService: {
        __args: { id: 'service-1', data: { partnerUserId: 'member-1' } },
        id: true,
      },
    });
  });

  it('does nothing when partner has no partnerUserId', async () => {
    query.mockResolvedValueOnce({ partners: oneEdge({ id: 'partner-1', partnerUserId: null }) });

    await stampPartnerUserFromPartner(client, 'partner-1', 'partnerService', 'service-1');

    expect(query).toHaveBeenCalledTimes(1);
    expect(mutation).not.toHaveBeenCalled();
  });

  it('does not rewrite when partnerContent already has matching partnerUserId', async () => {
    query
      .mockResolvedValueOnce({ partners: oneEdge({ id: 'partner-1', partnerUserId: 'member-1' }) })
      .mockResolvedValueOnce({ partnerContents: oneEdge({ id: 'content-1', partnerUserId: 'member-1' }) });

    await stampPartnerUserFromPartner(client, 'partner-1', 'partnerContent', 'content-1');

    expect(mutation).not.toHaveBeenCalled();
  });
  it('does nothing when the partner row is absent', async () => {
    query.mockResolvedValueOnce({ partners: noEdges });

    await stampPartnerUserFromPartner(client, 'partner-1', 'partnerService', 'service-1');

    expect(query).toHaveBeenCalledTimes(1);
    expect(mutation).not.toHaveBeenCalled();
  });

  it('does nothing when the child row is absent', async () => {
    query
      .mockResolvedValueOnce({ partners: oneEdge({ id: 'partner-1', partnerUserId: 'member-1' }) })
      .mockResolvedValueOnce({ partnerLinks: noEdges });

    await stampPartnerUserFromPartner(client, 'partner-1', 'partnerLink', 'link-1');

    expect(mutation).not.toHaveBeenCalled();
  });
});
