import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsSearchUsersHandler } from 'src/features/chat/logic-functions/handlers/teams-search-users-handler';

const {
  hasRolesPermissionMock,
  getTeamsWorkspaceGraphAccessMock,
  collectGraphUsersMock,
} = vi.hoisted(() => ({
  hasRolesPermissionMock: vi.fn(),
  getTeamsWorkspaceGraphAccessMock: vi.fn(),
  collectGraphUsersMock: vi.fn(),
}));

vi.mock(
  'src/features/chat/logic-functions/utils/current-user-has-roles-permission',
  () => ({ currentUserHasRolesPermission: hasRolesPermissionMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-workspace-graph-access',
  () => ({ getTeamsWorkspaceGraphAccess: getTeamsWorkspaceGraphAccessMock }),
);

vi.mock('src/features/chat/logic-functions/utils/collect-graph-users', () => ({
  collectGraphUsers: collectGraphUsersMock,
}));

describe('teamsSearchUsersHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasRolesPermissionMock.mockResolvedValue(true);
    getTeamsWorkspaceGraphAccessMock.mockResolvedValue({
      success: true,
      accessToken: 'token',
      tenantId: 'tenant-1',
    });
    collectGraphUsersMock.mockResolvedValue({
      users: [{ id: 'aad-ada', displayName: 'Ada', mail: 'ada@twenty.com' }],
      isTruncated: false,
    });
  });

  it('refuses a member without the roles permission', async () => {
    hasRolesPermissionMock.mockResolvedValue(false);

    const result = await teamsSearchUsersHandler({ body: { query: 'ada' } });

    expect(result.success).toBe(false);
    expect(collectGraphUsersMock).not.toHaveBeenCalled();
  });

  it('returns an empty list without hitting Graph for a blank query', async () => {
    const result = await teamsSearchUsersHandler({ body: { query: '   ' } });

    expect(result).toEqual({ success: true, teamsUsers: [] });
    expect(getTeamsWorkspaceGraphAccessMock).not.toHaveBeenCalled();
    expect(collectGraphUsersMock).not.toHaveBeenCalled();
  });

  it('searches the directory and maps the matches', async () => {
    const result = await teamsSearchUsersHandler({ body: { query: 'ada' } });

    expect(result).toEqual({
      success: true,
      teamsUsers: [
        {
          teamsUserAadObjectId: 'aad-ada',
          displayName: 'Ada',
          email: 'ada@twenty.com',
        },
      ],
    });
    expect(collectGraphUsersMock.mock.calls[0][0].url).toContain(
      'startswith',
    );
  });

  it('fails with a structured error when the directory read throws', async () => {
    collectGraphUsersMock.mockRejectedValue(new Error('boom'));

    const result = await teamsSearchUsersHandler({ body: { query: 'ada' } });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('boom');
    }
  });
});
