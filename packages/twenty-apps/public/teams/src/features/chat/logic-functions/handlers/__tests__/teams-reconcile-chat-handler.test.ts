import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsReconcileChatHandler } from 'src/features/chat/logic-functions/handlers/teams-reconcile-chat-handler';

const {
  releaseFlags,
  hasPermissionFlagMock,
  reconcileTeamsChatTenantClaimsMock,
} = vi.hoisted(() => ({
  releaseFlags: { IS_CHAT_ASSISTANT_RELEASED: true },
  hasPermissionFlagMock: vi.fn(),
  reconcileTeamsChatTenantClaimsMock: vi.fn(),
}));

vi.mock('src/constants/release-flags', () => ({
  RELEASE_FLAGS: releaseFlags,
}));

vi.mock(
  'src/features/chat/logic-functions/utils/current-user-has-permission-flag',
  () => ({ currentUserHasPermissionFlag: hasPermissionFlagMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/reconcile-teams-chat-tenant-claims',
  () => ({
    reconcileTeamsChatTenantClaims: reconcileTeamsChatTenantClaimsMock,
  }),
);

const CONTEXT = { workspaceId: 'this-workspace-id' };

describe('teamsReconcileChatHandler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = true;
    hasPermissionFlagMock.mockResolvedValue(true);
    reconcileTeamsChatTenantClaimsMock.mockResolvedValue([]);
  });

  it('refuses a member who cannot manage applications', async () => {
    hasPermissionFlagMock.mockResolvedValue(false);

    const result = await teamsReconcileChatHandler(
      { body: { isEnabled: true } },
      CONTEXT,
    );

    expect(hasPermissionFlagMock).toHaveBeenCalledExactlyOnceWith(
      'APPLICATIONS',
    );
    expect(result.success).toBe(false);
    expect(reconcileTeamsChatTenantClaimsMock).not.toHaveBeenCalled();
  });

  it('releases instead of claiming while chat is not released', async () => {
    releaseFlags.IS_CHAT_ASSISTANT_RELEASED = false;

    await teamsReconcileChatHandler({ body: { isEnabled: true } }, CONTEXT);

    expect(reconcileTeamsChatTenantClaimsMock).toHaveBeenCalledExactlyOnceWith({
      isChatEnabled: false,
      workspaceId: CONTEXT.workspaceId,
    });
  });
});
