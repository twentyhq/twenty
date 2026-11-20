import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsReconcileChatHandler } from 'src/features/chat/logic-functions/handlers/teams-reconcile-chat-handler';

const {
  releaseFlags,
  hasApplicationsPermissionMock,
  reconcileTeamsChatTenantClaimsMock,
} = vi.hoisted(() => ({
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: true },
  hasApplicationsPermissionMock: vi.fn(),
  reconcileTeamsChatTenantClaimsMock: vi.fn(),
}));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock(
  'src/features/chat/logic-functions/utils/current-user-has-applications-permission',
  () => ({
    currentUserHasApplicationsPermission: hasApplicationsPermissionMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/reconcile-teams-chat-tenant-claims',
  () => ({
    reconcileTeamsChatTenantClaims: reconcileTeamsChatTenantClaimsMock,
  }),
);

const CONTEXT = { workspaceId: 'this-workspace-id' };

const CLAIMED_CONNECTION = {
  connectedAccountId: 'workspace-connection',
  status: 'CLAIMED',
  tenantId: 'tenant-id',
};

describe('teamsReconcileChatHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
    hasApplicationsPermissionMock.mockResolvedValue(true);
    reconcileTeamsChatTenantClaimsMock.mockResolvedValue([CLAIMED_CONNECTION]);
  });

  it.each([undefined, 'true', 1, null])(
    'refuses a request whose enabled state is %s',
    async (isEnabled) => {
      const result = await teamsReconcileChatHandler(
        { body: { isEnabled } },
        CONTEXT,
      );

      expect(result.success).toBe(false);
      expect(hasApplicationsPermissionMock).not.toHaveBeenCalled();
      expect(reconcileTeamsChatTenantClaimsMock).not.toHaveBeenCalled();
    },
  );

  it('refuses a member who cannot manage applications', async () => {
    hasApplicationsPermissionMock.mockResolvedValue(false);

    const result = await teamsReconcileChatHandler(
      { body: { isEnabled: true } },
      CONTEXT,
    );

    expect(result).toEqual({
      success: false,
      message: 'Not allowed',
      error: expect.stringContaining('manage applications'),
    });
    expect(reconcileTeamsChatTenantClaimsMock).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'reconciles this workspace with the requested enabled state %s',
    async (isEnabled) => {
      expect(
        await teamsReconcileChatHandler({ body: { isEnabled } }, CONTEXT),
      ).toEqual({
        success: true,
        isChatEnabled: isEnabled,
        connections: [CLAIMED_CONNECTION],
      });
      expect(
        reconcileTeamsChatTenantClaimsMock,
      ).toHaveBeenCalledExactlyOnceWith({
        isChatEnabled: isEnabled,
        workspaceId: CONTEXT.workspaceId,
      });
    },
  );

  it('releases instead of claiming while chat is not released', async () => {
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;
    reconcileTeamsChatTenantClaimsMock.mockResolvedValue([]);

    expect(
      await teamsReconcileChatHandler({ body: { isEnabled: true } }, CONTEXT),
    ).toEqual({ success: true, isChatEnabled: false, connections: [] });
    expect(reconcileTeamsChatTenantClaimsMock).toHaveBeenCalledExactlyOnceWith({
      isChatEnabled: false,
      workspaceId: CONTEXT.workspaceId,
    });
  });

  it('reports a failure to list the connections', async () => {
    reconcileTeamsChatTenantClaimsMock.mockRejectedValue(
      new Error('connections unavailable'),
    );

    expect(
      await teamsReconcileChatHandler({ body: { isEnabled: true } }, CONTEXT),
    ).toEqual({
      success: false,
      message: 'Could not update Teams chat',
      error: 'connections unavailable',
    });
  });
});
