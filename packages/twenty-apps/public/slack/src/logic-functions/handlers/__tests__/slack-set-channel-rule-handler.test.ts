import { beforeEach, describe, expect, it, vi } from 'vitest';

import { slackSetChannelRuleHandler } from 'src/logic-functions/handlers/slack-set-channel-rule-handler';

const {
  coreApiClientMock,
  currentUserHasRolesPermissionMock,
  getSlackClientMock,
  conversationsInfoMock,
  authTestMock,
  findSlackChannelRuleMock,
  createSlackChannelRuleMock,
  updateSlackChannelRuleMock,
} = vi.hoisted(() => ({
  coreApiClientMock: vi.fn(),
  currentUserHasRolesPermissionMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  conversationsInfoMock: vi.fn(),
  authTestMock: vi.fn(),
  findSlackChannelRuleMock: vi.fn(),
  createSlackChannelRuleMock: vi.fn(),
  updateSlackChannelRuleMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: coreApiClientMock,
}));

vi.mock('src/logic-functions/utils/current-user-has-roles-permission', () => ({
  currentUserHasRolesPermission: currentUserHasRolesPermissionMock,
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/data/find-slack-channel-rule', () => ({
  findSlackChannelRule: findSlackChannelRuleMock,
}));

vi.mock('src/logic-functions/data/create-slack-channel-rule', () => ({
  createSlackChannelRule: createSlackChannelRuleMock,
}));

vi.mock('src/logic-functions/data/update-slack-channel-rule', () => ({
  updateSlackChannelRule: updateSlackChannelRuleMock,
}));

const INSTALLED_TEAM_ID = 'T0INSTALLED';

const buildPayload = (body: unknown) => ({ body });

const VALID_BODY = { slackChannelId: 'C0FIN', mode: 'SILENT' };

describe('slackSetChannelRuleHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    coreApiClientMock.mockImplementation(function () {
      return {};
    });
    currentUserHasRolesPermissionMock.mockResolvedValue(true);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: {
        auth: { test: authTestMock },
        conversations: { info: conversationsInfoMock },
      },
    });
    authTestMock.mockResolvedValue({ team_id: INSTALLED_TEAM_ID });
    conversationsInfoMock.mockResolvedValue({
      channel: {
        id: 'C0FIN',
        name: 'finance',
        is_private: true,
        context_team_id: INSTALLED_TEAM_ID,
      },
    });
    findSlackChannelRuleMock.mockResolvedValue(undefined);
    createSlackChannelRuleMock.mockResolvedValue('rule-1');
    updateSlackChannelRuleMock.mockResolvedValue(undefined);
  });

  it('should require a channel id', async () => {
    const result = await slackSetChannelRuleHandler(
      buildPayload({ mode: 'SILENT' }),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe('slackChannelId is required.');
    expect(currentUserHasRolesPermissionMock).not.toHaveBeenCalled();
  });

  it('should reject a mode it does not know', async () => {
    const result = await slackSetChannelRuleHandler(
      buildPayload({ slackChannelId: 'C0FIN', mode: 'READ_ONLY' }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid mode');
    expect(createSlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should refuse when the user lacks the roles permission', async () => {
    currentUserHasRolesPermissionMock.mockResolvedValue(false);

    const result = await slackSetChannelRuleHandler(buildPayload(VALID_BODY));

    expect(result.success).toBe(false);
    expect(result.message).toBe('Not allowed');
    expect(conversationsInfoMock).not.toHaveBeenCalled();
  });

  it('should fail when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'No Slack connection',
    });

    const result = await slackSetChannelRuleHandler(buildPayload(VALID_BODY));

    expect(result).toEqual({
      success: false,
      message: 'Slack is not connected',
      error: 'No Slack connection',
    });
  });

  it('should surface the Slack error when the channel lookup fails', async () => {
    conversationsInfoMock.mockRejectedValue(new Error('channel_not_found'));

    const result = await slackSetChannelRuleHandler(buildPayload(VALID_BODY));

    expect(result).toEqual({
      success: false,
      message: 'Could not confirm the channel with Slack',
      error: 'channel_not_found',
    });
    expect(createSlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should refuse a channel Slack does not return', async () => {
    conversationsInfoMock.mockResolvedValue({ ok: true });

    const result = await slackSetChannelRuleHandler(buildPayload(VALID_BODY));

    expect(result.success).toBe(false);
    expect(result.message).toBe('Slack channel not found');
    expect(createSlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should refuse a direct message conversation', async () => {
    conversationsInfoMock.mockResolvedValue({
      channel: { id: 'D123', is_im: true },
    });

    const result = await slackSetChannelRuleHandler(
      buildPayload({ slackChannelId: 'D123', mode: 'OPEN' }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toBe('Not a channel');
    expect(createSlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should create a rule with the channel name and team confirmed by Slack', async () => {
    const result = await slackSetChannelRuleHandler(buildPayload(VALID_BODY));

    expect(result.success).toBe(true);
    expect(result.message).toContain('#finance');
    expect(coreApiClientMock).toHaveBeenCalledWith({ runAs: 'application' });
    expect(createSlackChannelRuleMock).toHaveBeenCalledWith(expect.anything(), {
      name: 'finance',
      slackChannelId: 'C0FIN',
      slackTeamId: INSTALLED_TEAM_ID,
      mode: 'SILENT',
    });
    expect(updateSlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should fall back to the installed team when the channel carries no team id', async () => {
    conversationsInfoMock.mockResolvedValue({
      channel: { id: 'C0FIN', name: 'finance' },
    });

    await slackSetChannelRuleHandler(buildPayload(VALID_BODY));

    expect(createSlackChannelRuleMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ slackTeamId: INSTALLED_TEAM_ID }),
    );
  });

  it('should update the existing rule for the channel instead of creating a second one', async () => {
    findSlackChannelRuleMock.mockResolvedValue({
      id: 'rule-1',
      name: 'finance',
      slackChannelId: 'C0FIN',
      slackTeamId: INSTALLED_TEAM_ID,
      mode: 'OPEN',
    });

    const result = await slackSetChannelRuleHandler(
      buildPayload({ slackChannelId: 'C0FIN', mode: 'LINKED_MEMBERS_ONLY' }),
    );

    expect(result.success).toBe(true);
    expect(updateSlackChannelRuleMock).toHaveBeenCalledWith(expect.anything(), {
      id: 'rule-1',
      name: 'finance',
      slackTeamId: INSTALLED_TEAM_ID,
      mode: 'LINKED_MEMBERS_ONLY',
    });
    expect(createSlackChannelRuleMock).not.toHaveBeenCalled();
  });

  it('should fail with a structured result when the existing rule cannot be read', async () => {
    findSlackChannelRuleMock.mockRejectedValue(new Error('db down'));

    const result = await slackSetChannelRuleHandler(buildPayload(VALID_BODY));

    expect(result).toEqual({
      success: false,
      message: 'Could not look up the existing rule',
      error: 'db down',
    });
  });

  it('should fail with a structured result when the write errors', async () => {
    createSlackChannelRuleMock.mockRejectedValue(new Error('write failed'));

    const result = await slackSetChannelRuleHandler(buildPayload(VALID_BODY));

    expect(result).toEqual({
      success: false,
      message: 'Could not save the rule',
      error: 'write failed',
    });
  });
});
