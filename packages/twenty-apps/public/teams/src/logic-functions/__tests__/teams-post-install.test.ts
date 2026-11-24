import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsPostInstallHandler } from 'src/logic-functions/teams-post-install';

const { claimMock } = vi.hoisted(() => ({
  claimMock: vi.fn(),
}));

vi.mock(
  'src/features/chat/logic-functions/utils/claim-teams-tenants-of-existing-connections',
  () => ({ claimTeamsTenantsOfExistingConnections: claimMock }),
);

describe('teamsPostInstallHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    claimMock.mockResolvedValue({
      claimedConnectionCount: 1,
      conflictingConnectionCount: 0,
      failedConnectionCount: 0,
    });
  });

  it('should claim the tenants of the connections that already exist', async () => {
    await expect(teamsPostInstallHandler()).resolves.toEqual({
      claimedConnectionCount: 1,
      conflictingConnectionCount: 0,
      failedConnectionCount: 0,
    });
  });
});
