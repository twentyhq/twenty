import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackResolveUserLinkHandler } from 'src/logic-functions/handlers/slack-resolve-user-link-handler';

const {
  currentUserHasWorkspaceMembersPermissionMock,
  getSlackClientMock,
  authTestMock,
  resolveSlackUserByEmailMock,
  fetchSlackUserIdentityMock,
} = vi.hoisted(() => ({
  currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  authTestMock: vi.fn(),
  resolveSlackUserByEmailMock: vi.fn(),
  fetchSlackUserIdentityMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/utils/current-user-has-workspace-members-permission',
  () => ({
    currentUserHasWorkspaceMembersPermission:
      currentUserHasWorkspaceMembersPermissionMock,
  }),
);

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-user-by-email', () => ({
  resolveSlackUserByEmail: resolveSlackUserByEmailMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-user-identity', () => ({
  fetchSlackUserIdentity: fetchSlackUserIdentityMock,
}));

const INSTALLED_TEAM_ID = 'T0INSTALLED';

const buildPayload = (body: unknown) => ({ body });

describe('slackResolveUserLinkHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(true);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { auth: { test: authTestMock } },
    });
    authTestMock.mockResolvedValue({ team_id: INSTALLED_TEAM_ID });
  });

  it('should fail closed when nothing is provided', async () => {
    const result = await slackResolveUserLinkHandler(buildPayload({}));

    expect(result.success).toBe(false);
    expect(currentUserHasWorkspaceMembersPermissionMock).not.toHaveBeenCalled();
  });

  it('should refuse when the user lacks the workspace members permission', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackResolveUserLinkHandler(
      buildPayload({ email: 'ada@twenty.com' }),
    );

    expect(result.success).toBe(false);
  });

  it('should resolve an in-workspace user from an email', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue({
      slackUserId: 'U1',
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'Ada Lovelace',
    });

    const result = await slackResolveUserLinkHandler(
      buildPayload({ email: 'ada@twenty.com' }),
    );

    expect(result).toEqual({
      success: true,
      slackUser: {
        slackUserId: 'U1',
        slackTeamId: INSTALLED_TEAM_ID,
        displayName: 'Ada Lovelace',
        email: 'ada@twenty.com',
        isInInstalledWorkspace: true,
      },
    });
  });

  it('should fail closed when the installed workspace cannot be confirmed', async () => {
    authTestMock.mockRejectedValue(new Error('network'));
    resolveSlackUserByEmailMock.mockResolvedValue({
      slackUserId: 'U1',
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'Ada Lovelace',
    });

    const result = await slackResolveUserLinkHandler(
      buildPayload({ email: 'ada@twenty.com' }),
    );

    expect(result.success).toBe(false);
    expect(resolveSlackUserByEmailMock).not.toHaveBeenCalled();
  });

  it('should fail with a helpful error when the email is not in the workspace', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue(undefined);

    const result = await slackResolveUserLinkHandler(
      buildPayload({ email: 'guest@example.com' }),
    );

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toContain('Slack user id');
    }
  });

  it('should fail with a structured error when the email lookup throws', async () => {
    resolveSlackUserByEmailMock.mockRejectedValue(new Error('ratelimited'));

    const result = await slackResolveUserLinkHandler(
      buildPayload({ email: 'ada@example.com' }),
    );

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toBe('ratelimited');
    }
  });

  it('should fail closed when an id-only identity lookup omits the team', async () => {
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: 'U2',
      slackTeamId: undefined,
      displayName: 'Guest',
    });

    const result = await slackResolveUserLinkHandler(
      buildPayload({ slackUserId: 'U2' }),
    );

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toContain('team id');
    }
  });

  it('should refuse a supplied team id that does not match the Slack user', async () => {
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: 'U2',
      slackTeamId: INSTALLED_TEAM_ID,
      displayName: 'Ada Lovelace',
    });

    const result = await slackResolveUserLinkHandler(
      buildPayload({ slackUserId: 'U2', slackTeamId: 'T-EXTERNAL' }),
    );

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toContain('belongs to workspace');
    }
  });

  it('should resolve from a Slack user id and flag an out-of-workspace team', async () => {
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: 'U2',
      slackTeamId: 'T-EXTERNAL',
      displayName: 'Guest',
    });

    const result = await slackResolveUserLinkHandler(
      buildPayload({ slackUserId: 'U2', slackTeamId: 'T-EXTERNAL' }),
    );

    expect(result).toEqual({
      success: true,
      slackUser: {
        slackUserId: 'U2',
        slackTeamId: 'T-EXTERNAL',
        displayName: 'Guest',
        isInInstalledWorkspace: false,
      },
    });
  });
});
