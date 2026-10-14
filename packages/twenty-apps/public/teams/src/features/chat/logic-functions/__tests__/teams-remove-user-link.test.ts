import { beforeEach, describe, expect, it, vi } from 'vitest';

import { teamsRemoveUserLinkHandler } from 'src/features/chat/logic-functions/teams-remove-user-link';

const { coreApiClientMock, destroyTeamsUserLinkMock, hasRolesPermissionMock } =
  vi.hoisted(() => ({
    coreApiClientMock: vi.fn(function () {
      return {};
    }),
    destroyTeamsUserLinkMock: vi.fn(),
    hasRolesPermissionMock: vi.fn(),
  }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock(
  'src/features/chat/logic-functions/data/destroy-teams-user-link',
  () => ({ destroyTeamsUserLink: destroyTeamsUserLinkMock }),
);

vi.mock(
  'src/features/chat/logic-functions/utils/current-user-has-roles-permission',
  () => ({ currentUserHasRolesPermission: hasRolesPermissionMock }),
);

describe('teamsRemoveUserLinkHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hasRolesPermissionMock.mockResolvedValue(true);
    destroyTeamsUserLinkMock.mockResolvedValue(undefined);
  });

  it('should remove the link as the application', async () => {
    const result = await teamsRemoveUserLinkHandler({
      body: { id: 'link-id' },
    });

    expect(result.success).toBe(true);
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(destroyTeamsUserLinkMock).toHaveBeenCalledTimes(1);
    expect(destroyTeamsUserLinkMock).toHaveBeenCalledWith({
      client: expect.anything(),
      id: 'link-id',
    });
  });

  it('should reject a request without an id', async () => {
    const result = await teamsRemoveUserLinkHandler({ body: {} });

    expect(result.success).toBe(false);
    expect(destroyTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('should not remove the link for a member without the roles permission', async () => {
    hasRolesPermissionMock.mockResolvedValue(false);

    const result = await teamsRemoveUserLinkHandler({
      body: { id: 'link-id' },
    });

    expect(result.success).toBe(false);
    expect(destroyTeamsUserLinkMock).not.toHaveBeenCalled();
  });

  it('should report a failed removal', async () => {
    destroyTeamsUserLinkMock.mockRejectedValue(new Error('not found'));

    const result = await teamsRemoveUserLinkHandler({
      body: { id: 'link-id' },
    });

    expect(result).toEqual({
      success: false,
      message: 'Could not remove the link',
      error: 'not found',
    });
  });
});
