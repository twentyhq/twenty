import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsPostInstallHandler } from 'src/logic-functions/teams-post-install';

const { releaseFlags, claimMock } = vi.hoisted(() => ({
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: true },
  claimMock: vi.fn(),
}));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock(
  'src/features/chat/logic-functions/utils/claim-teams-tenants-of-existing-connections',
  () => ({ claimTeamsTenantsOfExistingConnections: claimMock }),
);

describe('teamsPostInstallHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
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

  it('should do nothing while chat is unreleased', async () => {
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;

    await expect(teamsPostInstallHandler()).resolves.toEqual({
      skipped: 'Chat is not released',
    });
    expect(claimMock).not.toHaveBeenCalled();
  });
});
