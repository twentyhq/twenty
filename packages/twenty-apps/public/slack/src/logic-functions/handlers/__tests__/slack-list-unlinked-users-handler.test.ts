import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackListUnlinkedUsersHandler } from 'src/logic-functions/handlers/slack-list-unlinked-users-handler';

const {
  currentUserHasRolesPermissionMock,
  getSlackClientMock,
  authTestMock,
  usersListMock,
  coreApiClientMock,
  listLinkedSlackUserIdsMock,
} = vi.hoisted(() => ({
  currentUserHasRolesPermissionMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  authTestMock: vi.fn(),
  usersListMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  listLinkedSlackUserIdsMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/current-user-has-roles-permission', () => ({
  currentUserHasRolesPermission: currentUserHasRolesPermissionMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/list-linked-slack-user-ids', () => ({
  listLinkedSlackUserIds: listLinkedSlackUserIdsMock,
}));

const INSTALLED_TEAM_ID = 'T0INSTALLED';

const ADA = {
  id: 'U0ADA',
  team_id: INSTALLED_TEAM_ID,
  real_name: 'Ada Lovelace',
  is_email_confirmed: true,
  profile: { display_name: 'ada', email: 'ada@twenty.com' },
};

const BOB = {
  id: 'U0BOB',
  team_id: INSTALLED_TEAM_ID,
  real_name: 'Bob Builder',
  is_email_confirmed: true,
  profile: { display_name: 'bob', email: 'bob@twenty.com' },
};

describe('slackListUnlinkedUsersHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasRolesPermissionMock.mockResolvedValue(true);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: {
        auth: { test: authTestMock },
        users: { list: usersListMock },
      },
    });
    authTestMock.mockResolvedValue({ team_id: INSTALLED_TEAM_ID });
    usersListMock.mockResolvedValue({ members: [ADA, BOB] });
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set());
  });

  it('should refuse when the user lacks the roles permission', async () => {
    currentUserHasRolesPermissionMock.mockResolvedValue(false);

    const result = await slackListUnlinkedUsersHandler();

    expect(result.success).toBe(false);
    expect(usersListMock).not.toHaveBeenCalled();
  });

  it('should fail closed when the installed workspace cannot be confirmed', async () => {
    authTestMock.mockRejectedValue(new Error('network'));

    const result = await slackListUnlinkedUsersHandler();

    expect(result.success).toBe(false);
    expect(usersListMock).not.toHaveBeenCalled();
  });

  it('should list roster members without a link', async () => {
    const result = await slackListUnlinkedUsersHandler();

    expect(result).toEqual({
      success: true,
      hasMore: false,
      slackUsers: [
        {
          slackUserId: 'U0ADA',
          slackTeamId: INSTALLED_TEAM_ID,
          displayName: 'ada',
          email: 'ada@twenty.com',
        },
        {
          slackUserId: 'U0BOB',
          slackTeamId: INSTALLED_TEAM_ID,
          displayName: 'bob',
          email: 'bob@twenty.com',
        },
      ],
    });
  });

  it('should leave out members that already have a link of any state', async () => {
    listLinkedSlackUserIdsMock.mockResolvedValue(new Set(['U0ADA']));

    const result = await slackListUnlinkedUsersHandler();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slackUsers.map((user) => user.slackUserId)).toEqual([
        'U0BOB',
      ]);
    }
  });

  it('should list a guest but leave their email out of the option', async () => {
    usersListMock.mockResolvedValue({
      members: [{ ...ADA, is_restricted: true }],
    });

    const result = await slackListUnlinkedUsersHandler();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slackUsers[0]?.email).toBeUndefined();
    }
  });

  it('should not report more results when exactly the cap is unlinked', async () => {
    usersListMock.mockResolvedValue({
      members: Array.from({ length: 20 }, (_, index) => ({
        id: `U${index}`,
        is_email_confirmed: true,
        real_name: `User ${index}`,
      })),
    });

    const result = await slackListUnlinkedUsersHandler();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slackUsers).toHaveLength(20);
      expect(result.hasMore).toBe(false);
    }
  });

  it('should stop early and report more results past the cap', async () => {
    usersListMock.mockResolvedValue({
      members: Array.from({ length: 30 }, (_, index) => ({
        id: `U${index}`,
        is_email_confirmed: true,
        real_name: `User ${index}`,
      })),
    });

    const result = await slackListUnlinkedUsersHandler();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.slackUsers).toHaveLength(20);
      expect(result.hasMore).toBe(true);
    }
  });

  it('should fail with a structured error when the roster read throws', async () => {
    usersListMock.mockRejectedValue(new Error('ratelimited'));

    const result = await slackListUnlinkedUsersHandler();

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toBe('ratelimited');
    }
  });
});
