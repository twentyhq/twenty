import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackSetUserLinkHandler } from 'src/logic-functions/handlers/slack-set-user-link-handler';

const {
  callerHasPermissionFlagMock,
  getSlackClientMock,
  authTestMock,
  findSlackUserLinkMock,
  createSlackUserLinkMock,
  updateSlackUserLinkMock,
} = vi.hoisted(() => ({
  callerHasPermissionFlagMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  authTestMock: vi.fn(),
  findSlackUserLinkMock: vi.fn(),
  createSlackUserLinkMock: vi.fn(),
  updateSlackUserLinkMock: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({
  callerHasPermissionFlag: callerHasPermissionFlagMock,
  PermissionFlagType: { WORKSPACE_MEMBERS: 'WORKSPACE_MEMBERS' },
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(),
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
    callerHasPermissionFlagMock.mockResolvedValue(true);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: { auth: { test: authTestMock } },
    });
    authTestMock.mockResolvedValue({ team_id: 'T0123456789' });
    findSlackUserLinkMock.mockResolvedValue(undefined);
  });

  it('should refuse when the caller lacks the workspace members permission', async () => {
    callerHasPermissionFlagMock.mockResolvedValue(false);

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(false);
    expect(callerHasPermissionFlagMock).toHaveBeenCalledWith(
      'WORKSPACE_MEMBERS',
    );
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

    const result = await slackSetUserLinkHandler(INPUT);

    expect(result.success).toBe(true);
    expect(updateSlackUserLinkMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'link-1',
      workspaceMemberId: INPUT.workspaceMemberId,
      source: 'MANUAL',
    });
    expect(createSlackUserLinkMock).not.toHaveBeenCalled();
  });
});
