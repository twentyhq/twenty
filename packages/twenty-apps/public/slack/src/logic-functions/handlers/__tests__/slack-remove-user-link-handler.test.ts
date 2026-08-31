import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackRemoveUserLinkHandler } from 'src/logic-functions/handlers/slack-remove-user-link-handler';

const {
  currentUserHasWorkspaceMembersPermissionMock,
  coreApiClientMock,
  destroySlackUserLinkMock,
} = vi.hoisted(() => ({
  currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  destroySlackUserLinkMock: vi.fn(),
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

vi.mock('src/logic-functions/data/destroy-slack-user-link', () => ({
  destroySlackUserLink: destroySlackUserLinkMock,
}));

const buildPayload = (body: unknown) => ({ body });

describe('slackRemoveUserLinkHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(true);
    destroySlackUserLinkMock.mockResolvedValue(undefined);
  });

  it('should refuse when the user lacks the workspace members permission', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackRemoveUserLinkHandler(
      buildPayload({ id: 'link-1' }),
    );

    expect(result.success).toBe(false);
    expect(destroySlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should fail closed when the id is missing', async () => {
    const result = await slackRemoveUserLinkHandler(buildPayload({}));

    expect(result.success).toBe(false);
    expect(currentUserHasWorkspaceMembersPermissionMock).not.toHaveBeenCalled();
    expect(destroySlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should delete the link with the application access', async () => {
    const result = await slackRemoveUserLinkHandler(
      buildPayload({ id: 'link-1' }),
    );

    expect(result.success).toBe(true);
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(destroySlackUserLinkMock).toHaveBeenCalledTimes(1);
    expect(destroySlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
    });
  });

  it('should fail with a structured result when the delete errors', async () => {
    destroySlackUserLinkMock.mockRejectedValueOnce(new Error('delete refused'));

    const result = await slackRemoveUserLinkHandler(
      buildPayload({ id: 'link-1' }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('delete refused');
  });
});
