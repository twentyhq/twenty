import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackSearchUsersHandler } from 'src/logic-functions/handlers/slack-search-users-handler';

const {
  currentUserHasWorkspaceMembersPermissionMock,
  getSlackClientMock,
  authTestMock,
  usersListMock,
} = vi.hoisted(() => ({
  currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  authTestMock: vi.fn(),
  usersListMock: vi.fn(),
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

const INSTALLED_TEAM_ID = 'T0INSTALLED';

const ADA = {
  id: 'U0ADA',
  real_name: 'Ada Lovelace',
  is_email_confirmed: true,
  profile: { display_name: 'ada', email: 'ada@twenty.com' },
};

const BOB = {
  id: 'U0BOB',
  real_name: 'Bob Builder',
  is_email_confirmed: true,
  profile: { display_name: 'bob', email: 'bob@twenty.com' },
};

const buildPayload = (query: unknown) => ({ body: { query } });

describe('slackSearchUsersHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(true);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: {
        auth: { test: authTestMock },
        users: { list: usersListMock },
      },
    });
    authTestMock.mockResolvedValue({ team_id: INSTALLED_TEAM_ID });
    usersListMock.mockResolvedValue({ members: [ADA, BOB] });
  });

  it('should return no users for an empty query without calling Slack', async () => {
    const result = await slackSearchUsersHandler(buildPayload('   '));

    expect(result).toEqual({ success: true, slackUsers: [] });
    expect(usersListMock).not.toHaveBeenCalled();
  });

  it('should refuse when the user lacks the workspace members permission', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackSearchUsersHandler(buildPayload('ada'));

    expect(result.success).toBe(false);
    expect(usersListMock).not.toHaveBeenCalled();
  });

  it('should refuse an empty query from someone without the permission rather than answering it', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackSearchUsersHandler(buildPayload('   '));

    expect(result.success).toBe(false);
  });

  it('should match by name or email, case-insensitively', async () => {
    const result = await slackSearchUsersHandler(buildPayload('ADA'));

    expect(result).toEqual({
      success: true,
      slackUsers: [
        {
          slackUserId: 'U0ADA',
          slackTeamId: INSTALLED_TEAM_ID,
          displayName: 'ada',
          email: 'ada@twenty.com',
        },
      ],
    });
  });

  it('should list a guest but leave their email out of the option', async () => {
    usersListMock.mockResolvedValue({
      members: [{ ...ADA, is_restricted: true }],
    });

    const result = await slackSearchUsersHandler(buildPayload('ada'));

    expect(result).toEqual({
      success: true,
      slackUsers: [
        {
          slackUserId: 'U0ADA',
          slackTeamId: INSTALLED_TEAM_ID,
          displayName: 'ada',
          email: undefined,
        },
      ],
    });
  });

  it('should leave an unconfirmed profile email out of the option', async () => {
    usersListMock.mockResolvedValue({
      members: [{ ...ADA, is_email_confirmed: false }],
    });

    const result = await slackSearchUsersHandler(buildPayload('ada'));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slackUsers[0]?.email).toBeUndefined();
    }
  });

  it('should skip bots and deleted accounts', async () => {
    usersListMock.mockResolvedValue({
      members: [
        { ...ADA, is_bot: true },
        { ...BOB, real_name: 'Ada Bobsdottir', deleted: true },
      ],
    });

    const result = await slackSearchUsersHandler(buildPayload('ada'));

    expect(result).toEqual({ success: true, slackUsers: [] });
  });

  it('should follow the roster cursor until it finds the match', async () => {
    usersListMock
      .mockResolvedValueOnce({
        members: [BOB],
        response_metadata: { next_cursor: 'cursor-2' },
      })
      .mockResolvedValueOnce({ members: [ADA] });

    const result = await slackSearchUsersHandler(buildPayload('ada@twenty'));

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slackUsers).toHaveLength(1);
    }
    expect(usersListMock).toHaveBeenCalledTimes(2);
    expect(usersListMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: 'cursor-2' }),
    );
  });

  it('should fail closed when the installed workspace cannot be confirmed', async () => {
    authTestMock.mockRejectedValue(new Error('network'));

    const result = await slackSearchUsersHandler(buildPayload('ada'));

    expect(result.success).toBe(false);
    expect(usersListMock).not.toHaveBeenCalled();
  });

  it('should fail with a structured error when the roster read throws', async () => {
    usersListMock.mockRejectedValue(new Error('ratelimited'));

    const result = await slackSearchUsersHandler(buildPayload('ada'));

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toBe('ratelimited');
    }
  });
});
