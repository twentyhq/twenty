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
} = vi.hoisted(() => ({
  currentUserHasWorkspaceMembersPermissionMock: vi.fn(),
  coreApiClientMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  authTestMock: vi.fn(),
  findSlackUserLinkMock: vi.fn(),
  createSlackUserLinkMock: vi.fn(),
  updateSlackUserLinkMock: vi.fn(),
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
});
