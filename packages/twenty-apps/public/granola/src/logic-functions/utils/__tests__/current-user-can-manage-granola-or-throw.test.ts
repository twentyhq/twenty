import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserCanManageGranolaOrThrow } from 'src/logic-functions/utils/current-user-can-manage-granola-or-throw.util';

const { metadataApiClientMock, queryMock } = vi.hoisted(() => ({
  metadataApiClientMock: vi.fn(),
  queryMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: metadataApiClientMock,
}));

const mockPermissionFlags = (permissionFlags: string[] | null) =>
  queryMock.mockResolvedValue({
    currentUser: { currentUserWorkspace: { permissionFlags } },
  });

describe('currentUserCanManageGranolaOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    metadataApiClientMock.mockImplementation(function (this: {
      query: typeof queryMock;
    }) {
      this.query = queryMock;
    });
  });

  it.each(['WORKSPACE_APPS', 'APPLICATIONS'])(
    'should allow when the current user has %s',
    async (permissionFlag) => {
      mockPermissionFlags(['WORKFLOWS', permissionFlag]);

      expect(await currentUserCanManageGranolaOrThrow()).toBe(true);
    },
  );

  it('should deny without the workspace apps flag', async () => {
    mockPermissionFlags(['WORKFLOWS', 'USER_APPS']);

    expect(await currentUserCanManageGranolaOrThrow()).toBe(false);
  });

  it('should deny when the current user workspace carries no flags', async () => {
    mockPermissionFlags(null);

    expect(await currentUserCanManageGranolaOrThrow()).toBe(false);
  });

  it('should throw when the permission query fails', async () => {
    queryMock.mockRejectedValue(new Error('unauthenticated'));

    await expect(currentUserCanManageGranolaOrThrow()).rejects.toThrow(
      'unauthenticated',
    );
  });
});
