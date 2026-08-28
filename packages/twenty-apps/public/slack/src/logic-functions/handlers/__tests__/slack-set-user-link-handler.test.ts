import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackSetUserLinkHandler } from 'src/logic-functions/handlers/slack-set-user-link-handler';

const {
  currentUserHasWorkspaceMembersPermissionMock,
  coreApiClientMock,
  getSlackClientMock,
  authTestMock,
  findSlackUserLinkMock,
  createSlackUserLinkMock,
  updateSlackUserLinkMock,
  resolveSlackUserByEmailMock,
} = vi.hoisted(() => ({
  currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  authTestMock: vi.fn(),
  findSlackUserLinkMock: vi.fn(),
  createSlackUserLinkMock: vi.fn(),
  updateSlackUserLinkMock: vi.fn(),
  resolveSlackUserByEmailMock: vi.fn(),
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

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-user-by-email', () => ({
  resolveSlackUserByEmail: resolveSlackUserByEmailMock,
}));

vi.mock('src/logic-functions/data/find-slack-user-link', () => ({
  findSlackUserLink: findSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/create-slack-user-link', () => ({
  createSlackUserLink: createSlackUserLinkMock,
}));

vi.mock('src/logic-functions/data/update-slack-user-link', () => ({
  updateSlackUserLink: updateSlackUserLinkMock,
}));

const INPUT = {
  slackUserId: 'U0123456789',
  workspaceMemberId: 'workspace-member-1',
};

describe('slackSetUserLinkHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(true);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { auth: { test: authTestMock } },
    });
    authTestMock.mockResolvedValue({ team_id: 'T0123456789' });
    findSlackUserLinkMock.mockResolvedValue(undefined);
  });

  it('should refuse when the triggering person lacks the workspace members permission', async () => {
    currentUserHasWorkspaceMembersPermissionMock.mockResolvedValue(false);

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should refuse when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should fail without creating when the link lookup errors', async () => {
    findSlackUserLinkMock.mockRejectedValue(new Error('GraphQL error'));

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(result.error).toBe('GraphQL error');
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should write the link with the application access', async () => {
    await slackSetUserLinkHandler(INPUT);

    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
  });

  it('should fail with a structured result when the write errors', async () => {
    createSlackUserLinkMock.mockRejectedValueOnce(new Error('write refused'));

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(result.error).toBe('write refused');
  });

  it('should not require a Slack connection when a team id is provided', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected.',
    });

    const result = await slackSetUserLinkHandler({
      ...INPUT,
      slackTeamId: 'T9876543210',
    });

    expect(result.success).toBe(true);
    expect(getSlackClientMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slackTeamId: 'T9876543210' }),
    );
  });

  it('should store the link under the requested team for Slack Connect users', async () => {
    const result = await slackSetUserLinkHandler({
      ...INPUT,
      slackTeamId: 'T9876543210',
    });

    expect(result.success).toBe(true);
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slackTeamId: 'T9876543210' }),
    );
  });

  it('should create a manual link when none exists', async () => {
    const result = await slackSetUserLinkHandler({ ...INPUT, name: 'Ada' });

    expect(result.success).toBe(true);
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      slackTeamId: 'T0123456789',
      slackUserId: INPUT.slackUserId,
      workspaceMemberId: INPUT.workspaceMemberId,
      name: 'Ada',
      source: 'MANUAL',
    });
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should update the existing link and mark it manual', async () => {
    findSlackUserLinkMock.mockResolvedValue({
      id: 'link-1',
      workspaceMemberId: 'someone-else',
      source: 'AUTO',
    });

    const result = await slackSetUserLinkHandler({ ...INPUT, name: 'Ada' });

    expect(result.success).toBe(true);
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
      workspaceMemberId: INPUT.workspaceMemberId,
      name: 'Ada',
      source: 'MANUAL',
    });
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should read the input from the route payload body', async () => {
    const result = await slackSetUserLinkHandler({
      body: { ...INPUT, name: 'Ada' },
      headers: {},
      queryStringParameters: {},
      pathParameters: {},
      isBase64Encoded: false,
      requestContext: {
        http: { method: 'POST', path: '/s/slack-user-links/set' },
      },
      userWorkspaceId: 'workspace-1',
    });

    expect(result.success).toBe(true);
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        slackUserId: INPUT.slackUserId,
        workspaceMemberId: INPUT.workspaceMemberId,
        name: 'Ada',
        source: 'MANUAL',
      }),
    );
  });

  it('should fail closed when required fields are blank', async () => {
    const result = await slackSetUserLinkHandler({
      ...INPUT,
      workspaceMemberId: '',
    });

    expect(result.success).toBe(false);
    expect(currentUserHasWorkspaceMembersPermissionMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should require a Slack email or a Slack user id', async () => {
    const result = await slackSetUserLinkHandler({
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(false);
    expect(currentUserHasWorkspaceMembersPermissionMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should resolve the Slack user by email when no user id is given', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue({
      slackUserId: 'U9999999999',
      slackTeamId: 'T0123456789',
      displayName: 'Ada Lovelace',
    });

    const result = await slackSetUserLinkHandler({
      email: 'ada@example.com',
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(true);
    expect(resolveSlackUserByEmailMock).toHaveBeenCalledWith(
      expect.anything(),
      'ada@example.com',
    );
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      slackTeamId: 'T0123456789',
      slackUserId: 'U9999999999',
      workspaceMemberId: 'workspace-member-1',
      name: 'Ada Lovelace',
      source: 'MANUAL',
    });
  });

  it('should refuse a team id that disagrees with the workspace the email resolved to', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue({
      slackUserId: 'U9999999999',
      slackTeamId: 'T0123456789',
      displayName: 'Ada Lovelace',
    });

    const result = await slackSetUserLinkHandler({
      email: 'ada@example.com',
      slackTeamId: 'T_ELSEWHERE',
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('T0123456789');
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
    expect(updateSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should fail with a helpful error when the email is not in the workspace', async () => {
    resolveSlackUserByEmailMock.mockResolvedValue(undefined);

    const result = await slackSetUserLinkHandler({
      email: 'guest@example.com',
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Slack user id');
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should fail with a structured error when the email lookup throws', async () => {
    resolveSlackUserByEmailMock.mockRejectedValue(new Error('ratelimited'));

    const result = await slackSetUserLinkHandler({
      email: 'ada@example.com',
      workspaceMemberId: 'workspace-member-1',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('ratelimited');
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });

  it('should prefer the Slack user id over the email when both are given', async () => {
    const result = await slackSetUserLinkHandler({
      ...INPUT,
      email: 'ada@example.com',
    });

    expect(result.success).toBe(true);
    expect(resolveSlackUserByEmailMock).not.toHaveBeenCalled();
    expect(createSlackUserLinkMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slackUserId: INPUT.slackUserId }),
    );
  });
});
