import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handler } from './on-workspace-member-created.logic-function';
import { resolvePartnerByEmail } from './services/resolve-partner-by-email.service';
import { linkPartnerUser } from './services/link-partner-user.service';
import { ensurePartnerRole } from './services/ensure-partner-role.service';

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: vi.fn() }));
vi.mock('twenty-client-sdk/metadata', () => ({ MetadataApiClient: vi.fn() }));
vi.mock('./services/resolve-partner-by-email.service', () => ({ resolvePartnerByEmail: vi.fn() }));
vi.mock('./services/link-partner-user.service', () => ({ linkPartnerUser: vi.fn() }));
vi.mock('./services/ensure-partner-role.service', () => ({ ensurePartnerRole: vi.fn() }));

const makePayload = (userEmail: string | null | undefined) => ({
  recordId: 'member-1',
  properties: { after: { userEmail } },
}) as never;

describe('on-workspace-member-created handler', () => {
  beforeEach(() => vi.clearAllMocks());

  it('skips when userEmail is missing', async () => {
    const res = await handler(makePayload(undefined));
    expect(res).toEqual({ skipped: true, reason: 'no_email' });
    expect(resolvePartnerByEmail).not.toHaveBeenCalled();
  });

  it('skips @twenty.com addresses', async () => {
    const res = await handler(makePayload('staff@twenty.com'));
    expect(res).toEqual({ skipped: true, reason: 'internal_email' });
    expect(resolvePartnerByEmail).not.toHaveBeenCalled();
  });

  it('skips when no partner matches', async () => {
    vi.mocked(resolvePartnerByEmail).mockResolvedValue(null);
    const res = await handler(makePayload('nobody@acme.com'));
    expect(res).toEqual({ skipped: true, reason: 'no_partner_match' });
    expect(linkPartnerUser).not.toHaveBeenCalled();
  });

  it('skips role/data when partner is already claimed by another member', async () => {
    vi.mocked(resolvePartnerByEmail).mockResolvedValue('partner-1');
    vi.mocked(linkPartnerUser).mockResolvedValue({ linked: false, reason: 'partner_already_linked_other' });
    const res = await handler(makePayload('a@acme.com'));
    expect(res).toEqual({ skipped: true, reason: 'partner_already_linked' });
    expect(ensurePartnerRole).not.toHaveBeenCalled();
  });

  it('links and enforces the role on a fresh match', async () => {
    vi.mocked(resolvePartnerByEmail).mockResolvedValue('partner-1');
    vi.mocked(linkPartnerUser).mockResolvedValue({ linked: true, partnerId: 'partner-1' });
    vi.mocked(ensurePartnerRole).mockResolvedValue({ roleOk: true, assigned: true });
    const res = await handler(makePayload('A@Acme.com'));
    expect(resolvePartnerByEmail).toHaveBeenCalledWith(expect.anything(), 'a@acme.com');
    expect(ensurePartnerRole).toHaveBeenCalledWith(expect.anything(), 'member-1');
    expect(res).toMatchObject({ linked: true, partnerId: 'partner-1', role: { roleOk: true, assigned: true } });
  });
});
