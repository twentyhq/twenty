import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackAccessModeSetHandler } from 'src/logic-functions/handlers/slack-access-mode-set-handler';

const { currentUserHasWorkspaceMembersPermissionMock, kvSetMock } = vi.hoisted(
  () => ({
    currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
    kvSetMock: vi.fn(),
  }),
);

vi.mock(
  'src/logic-functions/utils/current-user-has-workspace-members-permission',
  () => ({
    currentUserHasWorkspaceMembersPermission:
      currentUserHasWorkspaceMembersPermissionMock,
  }),
);

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { set: kvSetMock },
}));

const buildPayload = (body: unknown) =>
  ({
    body,
    headers: {},
    queryStringParameters: {},
    pathParameters: {},
    isBase64Encoded: false,
    requestContext: { http: { method: 'POST', path: '/s/slack-access-mode/set' } },
    userWorkspaceId: 'workspace-1',
  }) as never;

describe('slackAccessModeSetHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(true);
  });

  it('should refuse when the user lacks the workspace members permission', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackAccessModeSetHandler(
      buildPayload({ accessMode: 'ONLY_LINKED_MEMBERS' }),
    );

    expect(result.success).toBe(false);
    expect(kvSetMock).not.toHaveBeenCalled();
  });

  it('should reject an invalid access mode', async () => {
    const result = await slackAccessModeSetHandler(
      buildPayload({ accessMode: 'NONSENSE' }),
    );

    expect(result.success).toBe(false);
    expect(kvSetMock).not.toHaveBeenCalled();
  });

  it('should store a valid access mode in the workspace key value store', async () => {
    const result = await slackAccessModeSetHandler(
      buildPayload({ accessMode: 'ONLY_LINKED_MEMBERS' }),
    );

    expect(result.success).toBe(true);
    expect(result.accessMode).toBe('ONLY_LINKED_MEMBERS');
    expect(kvSetMock).toHaveBeenCalledWith(
      'slack-access-mode',
      'ONLY_LINKED_MEMBERS',
      { scope: 'WORKSPACE' },
    );
  });

  it('should fail with a structured result when the write errors', async () => {
    kvSetMock.mockRejectedValueOnce(new Error('kv down'));

    const result = await slackAccessModeSetHandler(
      buildPayload({ accessMode: 'ANYONE' }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('kv down');
  });
});
