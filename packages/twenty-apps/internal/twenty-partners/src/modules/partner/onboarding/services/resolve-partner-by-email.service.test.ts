import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { resolvePartnerByEmail } from './resolve-partner-by-email.service';

describe('resolvePartnerByEmail', () => {
  const query = vi.fn();
  const client = { query } as unknown as CoreApiClient;

  beforeEach(() => query.mockReset());

  it('returns the partner id for a VALIDATED, unlinked partner', async () => {
    query.mockResolvedValueOnce({
      people: {
        edges: [
          { node: { id: 'p-1', partner: { id: 'partner-1', validationStage: 'VALIDATED', partnerUserId: null } } },
        ],
      },
    });
    await expect(resolvePartnerByEmail(client, 'a@b.com')).resolves.toBe('partner-1');
  });

  it('returns null when no Person matches', async () => {
    query.mockResolvedValueOnce({ people: { edges: [] } });
    await expect(resolvePartnerByEmail(client, 'a@b.com')).resolves.toBeNull();
  });

  it('returns the partner id even when already linked (classification deferred to linkPartnerUser)', async () => {
    query.mockResolvedValueOnce({
      people: { edges: [{ node: { id: 'p-1', partner: { id: 'partner-1', validationStage: 'VALIDATED', partnerUserId: 'member-9' } } }] },
    });
    await expect(resolvePartnerByEmail(client, 'a@b.com')).resolves.toBe('partner-1');
  });

  it('returns null when the matched partner is not VALIDATED', async () => {
    query.mockResolvedValueOnce({
      people: { edges: [{ node: { id: 'p-1', partner: { id: 'partner-1', validationStage: 'APPLICATION', partnerUserId: null } } }] },
    });
    await expect(resolvePartnerByEmail(client, 'a@b.com')).resolves.toBeNull();
  });
});
