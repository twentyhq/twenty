import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsListUnlinkedUsersHandler } from 'src/features/chat/logic-functions/handlers/teams-list-unlinked-users-handler';

const {
  hasRolesPermissionMock,
  getTeamsWorkspaceGraphAccessMock,
  collectGraphUsersMock,
  listLinkedTeamsUserAadObjectIdsMock,
  coreApiClientMock,
} = vi.hoisted(() => ({
  hasRolesPermissionMock: vi.fn(),
  getTeamsWorkspaceGraphAccessMock: vi.fn(),
  collectGraphUsersMock: vi.fn(),
  listLinkedTeamsUserAadObjectIdsMock: vi.fn(),
  coreApiClientMock: vi.fn(function () {
    return {};
  }),
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

vi.mock(
  'src/features/chat/logic-functions/data/list-linked-teams-user-aad-object-ids',
  () => ({
    listLinkedTeamsUserAadObjectIds: listLinkedTeamsUserAadObjectIdsMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

const ADA = { id: 'aad-ada', displayName: 'Ada', mail: 'ada@twenty.com' };
const BOB = {
  id: 'aad-bob',
  displayName: 'Bob',
  userPrincipalName: 'bob@twenty.com',
};

describe('teamsListUnlinkedUsersHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasRolesPermissionMock.mockResolvedValue(true);
    getTeamsWorkspaceGraphAccessMock.mockResolvedValue({
      success: true,
      accessToken: 'token',
      tenantId: 'tenant-1',
    });
    listLinkedTeamsUserAadObjectIdsMock.mockResolvedValue(new Set());
    collectGraphUsersMock.mockResolvedValue({
      users: [ADA, BOB],
      isTruncated: false,
    });
  });

  it('refuses a member without the roles permission', async () => {
    hasRolesPermissionMock.mockResolvedValue(false);

    const result = await teamsListUnlinkedUsersHandler();

    expect(result.success).toBe(false);
    expect(collectGraphUsersMock).not.toHaveBeenCalled();
  });

  it('fails when Teams is not connected', async () => {
    getTeamsWorkspaceGraphAccessMock.mockResolvedValue({
      success: false,
      error: 'Microsoft Teams is not connected for this workspace.',
    });

    const result = await teamsListUnlinkedUsersHandler();

    expect(result.success).toBe(false);
    expect(collectGraphUsersMock).not.toHaveBeenCalled();
  });

  it('maps directory users to options and excludes already-linked Entra ids', async () => {
    listLinkedTeamsUserAadObjectIdsMock.mockResolvedValue(new Set(['aad-ada']));
    collectGraphUsersMock.mockImplementation(
      async ({
        shouldCollectUser,
      }: {
        shouldCollectUser?: (user: { id: string }) => boolean;
      }) => ({
        users: [ADA, BOB].filter(
          (user) => !shouldCollectUser || shouldCollectUser(user),
        ),
        isTruncated: false,
      }),
    );

    const result = await teamsListUnlinkedUsersHandler();

    expect(result).toEqual({
      success: true,
      hasMore: false,
      teamsUsers: [
        {
          teamsUserAadObjectId: 'aad-bob',
          displayName: 'Bob',
          email: 'bob@twenty.com',
        },
      ],
    });
    expect(listLinkedTeamsUserAadObjectIdsMock).toHaveBeenCalledWith({
      client: expect.anything(),
      teamsTenantId: 'tenant-1',
    });
  });

  it('passes the truncation flag through as hasMore', async () => {
    collectGraphUsersMock.mockResolvedValue({
      users: [ADA],
      isTruncated: true,
    });

    const result = await teamsListUnlinkedUsersHandler();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.hasMore).toBe(true);
    }
  });

  it('fails with a structured error when the directory read throws', async () => {
    collectGraphUsersMock.mockRejectedValue(new Error('boom'));

    const result = await teamsListUnlinkedUsersHandler();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('boom');
    }
  });
});
