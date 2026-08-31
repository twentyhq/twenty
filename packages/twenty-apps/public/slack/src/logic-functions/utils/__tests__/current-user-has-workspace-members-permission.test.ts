import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserHasWorkspaceMembersPermission } from 'src/logic-functions/utils/current-user-has-workspace-members-permission';

const { metadataApiClientMock, queryMock } = vi.hoisted(() => ({
  metadataApiClientMock: vi.fn(),
  queryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: metadataApiClientMock,
}));

describe('currentUserHasWorkspaceMembersPermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    metadataApiClientMock.mockImplementation(function (this: {
      query: typeof queryMock;
    }) {
      this.query = queryMock;
    });
  });

  it('should allow when the current user has the workspace members flag', async () => {
    queryMock.mockResolvedValue({
      currentUser: {
        currentUserWorkspace: {
          permissionFlags: ['SETTINGS', 'WORKSPACE_MEMBERS'],
        },
      },
    });

    expect(await currentUserHasWorkspaceMembersPermission()).toBe(true);
  });

  it('should deny when the workspace members flag is absent', async () => {
    queryMock.mockResolvedValue({
      currentUser: {
        currentUserWorkspace: { permissionFlags: ['SETTINGS'] },
      },
    });

    expect(await currentUserHasWorkspaceMembersPermission()).toBe(false);
  });

  it('should deny when the current user workspace carries no flags', async () => {
    queryMock.mockResolvedValue({
      currentUser: { currentUserWorkspace: { permissionFlags: null } },
    });

    expect(await currentUserHasWorkspaceMembersPermission()).toBe(false);
  });

  it('should deny when nobody is behind the request', async () => {
    queryMock.mockResolvedValue({ currentUser: null });

    expect(await currentUserHasWorkspaceMembersPermission()).toBe(false);
  });

  it('should deny when the permission query throws', async () => {
    queryMock.mockRejectedValue(new Error('unauthenticated'));

    expect(await currentUserHasWorkspaceMembersPermission()).toBe(false);
  });
});
