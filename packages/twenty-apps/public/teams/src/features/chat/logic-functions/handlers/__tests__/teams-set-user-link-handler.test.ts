import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsSetUserLinkHandler } from 'src/features/chat/logic-functions/handlers/teams-set-user-link-handler';

const {
  hasRolesPermissionMock,
  getTeamsWorkspaceGraphAccessMock,
  coreApiClientMock,
  doesWorkspaceMemberExistMock,
  findTeamsUserLinkMock,
  createTeamsUserLinkMock,
  updateTeamsUserLinkMock,
} = vi.hoisted(() => ({
  hasRolesPermissionMock: vi.fn(),
  getTeamsWorkspaceGraphAccessMock: vi.fn(),
  coreApiClientMock: vi.fn(function () {
    return {};
  }),
  doesWorkspaceMemberExistMock: vi.fn(),
  findTeamsUserLinkMock: vi.fn(),
  createTeamsUserLinkMock: vi.fn(),
  updateTeamsUserLinkMock: vi.fn(),
}));

vi.mock(
  'src/features/chat/logic-functions/utils/current-user-has-roles-permission',
  () => ({ currentUserHasRolesPermission: hasRolesPermissionMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/get-teams-workspace-graph-access',
  () => ({ getTeamsWorkspaceGraphAccess: getTeamsWorkspaceGraphAccessMock }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/features/chat/logic-functions/data/does-workspace-member-exist',
  () => ({ doesWorkspaceMemberExist: doesWorkspaceMemberExistMock }),
);

vi.mock('src/features/chat/logic-functions/data/find-teams-user-link', () => ({
  findTeamsUserLink: findTeamsUserLinkMock,
}));

vi.mock('src/features/chat/logic-functions/data/create-teams-user-link', () => ({
  createTeamsUserLink: createTeamsUserLinkMock,
}));

vi.mock('src/features/chat/logic-functions/data/update-teams-user-link', () => ({
  updateTeamsUserLink: updateTeamsUserLinkMock,
}));

const VALID_INPUT = {
  body: {
    workspaceMemberId: 'member-1',
    teamsUserAadObjectId: 'aad-1',
    name: 'Ada',
  },
};

describe('teamsSetUserLinkHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasRolesPermissionMock.mockResolvedValue(true);
    getTeamsWorkspaceGraphAccessMock.mockResolvedValue({
      success: true,
      accessToken: 'token',
      tenantId: 'tenant-1',
    });
    doesWorkspaceMemberExistMock.mockResolvedValue(true);
    findTeamsUserLinkMock.mockResolvedValue(undefined);
    createTeamsUserLinkMock.mockResolvedValue(undefined);
    updateTeamsUserLinkMock.mockResolvedValue(undefined);
  });

  it('rejects a request missing required fields', async () => {
    const result = await teamsSetUserLinkHandler({
      body: { workspaceMemberId: 'member-1' },
    });

    expect(result.success).toBe(false);
    expect(createTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('refuses a member without the roles permission', async () => {
    hasRolesPermissionMock.mockResolvedValue(false);

    const result = await teamsSetUserLinkHandler(VALID_INPUT);

    expect(result.success).toBe(false);
    expect(createTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('fails when Teams is not connected', async () => {
    getTeamsWorkspaceGraphAccessMock.mockResolvedValue({
      success: false,
      error: 'not connected',
    });

    const result = await teamsSetUserLinkHandler(VALID_INPUT);

    expect(result.success).toBe(false);
    expect(createTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('fails when the workspace member does not exist', async () => {
    doesWorkspaceMemberExistMock.mockResolvedValue(false);

    const result = await teamsSetUserLinkHandler(VALID_INPUT);

    expect(result.success).toBe(false);
    expect(createTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('creates a MANUAL link with the server-resolved tenant as the application', async () => {
    const result = await teamsSetUserLinkHandler(VALID_INPUT);

    expect(result.success).toBe(true);
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(createTeamsUserLinkMock).toHaveBeenCalledTimes(1);
    expect(createTeamsUserLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        teamsTenantId: 'tenant-1',
        teamsUserAadObjectId: 'aad-1',
        workspaceMemberId: 'member-1',
        name: 'Ada',
        source: 'MANUAL',
      }),
    );
    expect(updateTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('relinks an existing link in place as MANUAL to the new member', async () => {
    findTeamsUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: 'other-member',
      source: 'AUTO',
    });

    const result = await teamsSetUserLinkHandler(VALID_INPUT);

    expect(result.success).toBe(true);
    expect(updateTeamsUserLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'link-1',
        workspaceMemberId: 'member-1',
        name: 'Ada',
        source: 'MANUAL',
      }),
    );
    expect(createTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('reports a failed write', async () => {
    createTeamsUserLinkMock.mockRejectedValue(new Error('duplicate'));

    const result = await teamsSetUserLinkHandler(VALID_INPUT);

    expect(result).toEqual({
      success: false,
      message: 'Could not save the link',
      error: 'duplicate',
    });
  });
});
