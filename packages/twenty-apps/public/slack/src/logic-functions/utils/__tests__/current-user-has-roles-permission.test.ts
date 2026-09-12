import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';

const { metadataApiClientMock, queryMock } = vi.hoisted(() => ({
  metadataApiClientMock: vi.fn(),
  queryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: metadataApiClientMock,
}));

describe('currentUserHasRolesPermission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    metadataApiClientMock.mockImplementation(function (this: {
      query: typeof queryMock;
    }) {
      this.query = queryMock;
    });
  });

  it('should allow when the current user has the roles flag', async () => {
    queryMock.mockResolvedValue({
      currentUser: {
        currentUserWorkspace: {
          permissionFlags: ['SETTINGS', 'ROLES'],
        },
      },
    });

    expect(await currentUserHasRolesPermission()).toBe(true);
  });

  it('should deny when the roles flag is absent', async () => {
    queryMock.mockResolvedValue({
      currentUser: {
        currentUserWorkspace: { permissionFlags: ['SETTINGS'] },
      },
    });

    expect(await currentUserHasRolesPermission()).toBe(false);
  });

  it('should deny when the current user workspace carries no flags', async () => {
    queryMock.mockResolvedValue({
      currentUser: { currentUserWorkspace: { permissionFlags: null } },
    });

    expect(await currentUserHasRolesPermission()).toBe(false);
  });

  it('should deny when nobody is behind the request', async () => {
    queryMock.mockResolvedValue({ currentUser: null });

    expect(await currentUserHasRolesPermission()).toBe(false);
  });

  it('should deny when the permission query throws', async () => {
    queryMock.mockRejectedValue(new Error('unauthenticated'));

    expect(await currentUserHasRolesPermission()).toBe(false);
  });
});
