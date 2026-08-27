import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackRemoveUserLinkHandler } from 'src/logic-functions/handlers/slack-remove-user-link-handler';

const {
  currentUserHasWorkspaceMembersPermissionMock,
  coreApiClientMock,
  deleteSlackUserLinkMock,
} = vi.hoisted(() => ({
  currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  deleteSlackUserLinkMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/utils/current-user-has-workspace-members-permission',
  () => ({
    currentUserHasWorkspaceMembersPermission:
      currentUserHasWorkspaceMembersPermissionMock,
  }),
);

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/data/delete-slack-user-link', () => ({
  deleteSlackUserLink: deleteSlackUserLinkMock,
}));

const buildPayload = (body: unknown) => ({ body });

describe('slackRemoveUserLinkHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(true);
    deleteSlackUserLinkMock.mockResolvedValue(undefined);
  });

  it('should refuse when the user lacks the workspace members permission', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackRemoveUserLinkHandler(
      buildPayload({ id: 'link-1' }),
    );

    expect(result.success).toBe(false);
    expect(deleteSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should fail closed when the id is missing', async () => {
    const result = await slackRemoveUserLinkHandler(buildPayload({}));

    expect(result.success).toBe(false);
    expect(currentUserHasWorkspaceMembersPermissionMock).not.toHaveBeenCalled();
    expect(deleteSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should delete the link with the application access', async () => {
    const result = await slackRemoveUserLinkHandler(
      buildPayload({ id: 'link-1' }),
    );

    expect(result.success).toBe(true);
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(deleteSlackUserLinkMock).toHaveBeenCalledTimes(1);
    expect(deleteSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
    });
  });

  it('should fail with a structured result when the delete errors', async () => {
    deleteSlackUserLinkMock.mockRejectedValueOnce(new Error('delete refused'));

    const result = await slackRemoveUserLinkHandler(
      buildPayload({ id: 'link-1' }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('delete refused');
  });
});
