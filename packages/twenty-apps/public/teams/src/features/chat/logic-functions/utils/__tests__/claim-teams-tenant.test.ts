import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildTeamsTenantKvKey } from 'src/features/chat/logic-functions/utils/build-teams-tenant-kv-key';
import { claimTeamsTenant } from 'src/features/chat/logic-functions/utils/claim-teams-tenant';

const { kvGetMock, kvSetMock } = vi.hoisted(() => ({
  kvGetMock: vi.fn(),
  kvSetMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: kvGetMock, set: kvSetMock },
}));

const TENANT_ID = 'tenant-id';

describe('claimTeamsTenant', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should claim the tenant for this workspace', async () => {
    expect(await claimTeamsTenant(TENANT_ID)).toEqual({ isClaimed: true });
    expect(kvSetMock).toHaveBeenCalledExactlyOnceWith(
      buildTeamsTenantKvKey(TENANT_ID),
      null,
      { scope: 'SERVER' },
    );
    expect(kvGetMock).not.toHaveBeenCalled();
  });

  it('should report a lost claim when another workspace holds the tenant', async () => {
    kvSetMock.mockRejectedValue(new Error('kv.set() failed: already claimed'));
    kvGetMock.mockResolvedValue('other-workspace-id');

    expect(await claimTeamsTenant(TENANT_ID)).toEqual({ isClaimed: false });
    expect(kvGetMock).toHaveBeenCalledExactlyOnceWith(
      buildTeamsTenantKvKey(TENANT_ID),
      { scope: 'SERVER' },
    );
  });

  it('should rethrow when the claim fails and nobody holds the tenant', async () => {
    kvSetMock.mockRejectedValue(new Error('kv.set() failed: HTTP 503'));
    kvGetMock.mockResolvedValue(null);

    await expect(claimTeamsTenant(TENANT_ID)).rejects.toThrow('HTTP 503');
  });
});
