import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsMatchUserLinksHandler } from 'src/features/chat/logic-functions/handlers/teams-match-user-links-handler';
import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';

const {
  isTeamsChatEnabledMock,
  hasRolesPermissionMock,
  getTeamsWorkspaceGraphAccessMock,
  matchTeamsDirectoryByEmailMock,
} = vi.hoisted(() => ({
  isTeamsChatEnabledMock: vi.fn(),
  hasRolesPermissionMock: vi.fn(),
  getTeamsWorkspaceGraphAccessMock: vi.fn(),
  matchTeamsDirectoryByEmailMock: vi.fn(),
}));

vi.mock(
  'src/features/chat/logic-functions/utils/is-teams-chat-enabled',
  () => ({
    isTeamsChatEnabled: isTeamsChatEnabledMock,
  }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/current-user-has-roles-permission',
  () => ({ currentUserHasRolesPermission: hasRolesPermissionMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-workspace-graph-access',
  () => ({ getTeamsWorkspaceGraphAccess: getTeamsWorkspaceGraphAccessMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/match-teams-directory-by-email',
  () => ({ matchTeamsDirectoryByEmail: matchTeamsDirectoryByEmailMock }),
);

const SUMMARY = {
  linkedCount: 2,
  alreadyLinkedCount: 1,
  unmatchedCount: 0,
  ambiguousEmailCount: 0,
  failedCount: 0,
  isDirectoryTruncated: false,
};

describe('teamsMatchUserLinksHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isTeamsChatEnabledMock.mockReturnValue(true);
    hasRolesPermissionMock.mockResolvedValue(true);
    getTeamsWorkspaceGraphAccessMock.mockResolvedValue({
      success: true,
      accessToken: 'token',
      tenantId: 'tenant-1',
    });
    matchTeamsDirectoryByEmailMock.mockResolvedValue(SUMMARY);
  });

  it('refuses to run while chat is disabled', async () => {
    isTeamsChatEnabledMock.mockReturnValue(false);

    const result = await teamsMatchUserLinksHandler();

    expect(result.success).toBe(false);
    expect(hasRolesPermissionMock).not.toHaveBeenCalled();
    expect(matchTeamsDirectoryByEmailMock).not.toHaveBeenCalled();
  });

  it('refuses a member without the roles permission', async () => {
    hasRolesPermissionMock.mockResolvedValue(false);

    const result = await teamsMatchUserLinksHandler();

    expect(result.success).toBe(false);
    expect(matchTeamsDirectoryByEmailMock).not.toHaveBeenCalled();
  });

  it('fails when Teams is not connected', async () => {
    getTeamsWorkspaceGraphAccessMock.mockResolvedValue({
      success: false,
      error: 'Microsoft Teams is not connected for this workspace.',
    });

    const result = await teamsMatchUserLinksHandler();

    expect(result).toEqual({
      success: false,
      message: 'Microsoft Teams is not connected',
      error: 'Microsoft Teams is not connected for this workspace.',
    });
    expect(matchTeamsDirectoryByEmailMock).not.toHaveBeenCalled();
  });

  it('runs the match against the workspace connection and summarises it', async () => {
    const result = await teamsMatchUserLinksHandler();

    expect(matchTeamsDirectoryByEmailMock).toHaveBeenCalledWith({
      accessToken: 'token',
      teamsTenantId: 'tenant-1',
    });
    expect(result).toEqual({
      success: true,
      message: 'Matched 2 Teams users by email. 1 already linked.',
      ...SUMMARY,
    });
  });

  it('turns a directory permission error into a reconnect hint', async () => {
    matchTeamsDirectoryByEmailMock.mockRejectedValue(
      new GraphRequestError({
        message: 'forbidden',
        status: 403,
        innerErrorCode: undefined,
      }),
    );

    const result = await teamsMatchUserLinksHandler();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toBe('Could not match Teams users');
      expect(result.error).toContain('Reconnect Microsoft Teams');
    }
  });
});
