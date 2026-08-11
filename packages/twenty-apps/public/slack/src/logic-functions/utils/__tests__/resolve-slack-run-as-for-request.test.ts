import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackRunAsForRequest } from 'src/logic-functions/utils/resolve-slack-run-as-for-request';

const {
  findSlackAssistantRequestCreatedByMock,
  getSlackClientMock,
  resolveSlackBotUserIdOrThrowMock,
  resolveSlackRunAsWorkspaceMemberIdMock,
} = vi.hoisted(() => ({
  findSlackAssistantRequestCreatedByMock: vi.fn(),
  getSlackClientMock: vi.fn(),
  resolveSlackBotUserIdOrThrowMock: vi.fn(),
  resolveSlackRunAsWorkspaceMemberIdMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/data/find-slack-assistant-request-created-by',
  () => ({
    findSlackAssistantRequestCreatedBy: findSlackAssistantRequestCreatedByMock,
  }),
);

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-bot-user-id-or-throw', () => ({
  resolveSlackBotUserIdOrThrow: resolveSlackBotUserIdOrThrowMock,
}));

vi.mock(
  'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id',
  () => ({
    resolveSlackRunAsWorkspaceMemberId: resolveSlackRunAsWorkspaceMemberIdMock,
  }),
);

const client = {} as CoreApiClient;

const SLACK_USER_ID = 'U0123456789';
const BOT_USER_ID = 'U0BOT';
const REQUEST_TEXT = 'who owns ACME?';

const IDENTITY: SlackUserIdentity = {
  slackUserId: SLACK_USER_ID,
  slackTeamId: 'T0INSTALLED',
  displayName: 'ada',
  email: 'ada@twenty.com',
  isRegularUserAccount: true,
};

const MENTION_MESSAGE: SlackThreadMessage = {
  ts: '1700000000.000200',
  user: SLACK_USER_ID,
  text: `<@${BOT_USER_ID}> ${REQUEST_TEXT}`,
};

const resolve = (
  overrides: Partial<{
    requestText: string;
    requestMessage: SlackThreadMessage | undefined;
    identity: SlackUserIdentity | undefined;
  }> = {},
) =>
  resolveSlackRunAsForRequest({
    client,
    identity: 'identity' in overrides ? overrides.identity : IDENTITY,
    requestId: 'request-1',
    requestText: overrides.requestText ?? REQUEST_TEXT,
    requestMessage:
      'requestMessage' in overrides
        ? overrides.requestMessage
        : MENTION_MESSAGE,
  });

describe('resolveSlackRunAsForRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findSlackAssistantRequestCreatedByMock.mockResolvedValue({
      source: 'APPLICATION',
      workspaceMemberId: null,
    });
    getSlackClientMock.mockResolvedValue({ success: true, client: {} });
    resolveSlackBotUserIdOrThrowMock.mockResolvedValue(BOT_USER_ID);
    resolveSlackRunAsWorkspaceMemberIdMock.mockResolvedValue('member-1');
  });

  it('should run as the member when the record and the Slack message agree', async () => {
    expect(await resolve()).toBe('member-1');
  });

  it('should refuse a request created by hand in the UI', async () => {
    findSlackAssistantRequestCreatedByMock.mockResolvedValue({
      source: 'MANUAL',
      workspaceMemberId: 'member-2',
    });

    expect(await resolve()).toBeUndefined();
    expect(resolveSlackRunAsWorkspaceMemberIdMock).not.toHaveBeenCalled();
  });

  it('should refuse an actor claiming the application but carrying a member', async () => {
    findSlackAssistantRequestCreatedByMock.mockResolvedValue({
      source: 'APPLICATION',
      workspaceMemberId: 'member-2',
    });

    expect(await resolve()).toBeUndefined();
  });

  it('should refuse when the named user did not post the message', async () => {
    expect(
      await resolve({
        requestMessage: { ...MENTION_MESSAGE, user: 'U0SOMEONEELSE' },
      }),
    ).toBeUndefined();
    expect(findSlackAssistantRequestCreatedByMock).not.toHaveBeenCalled();
  });

  it('should refuse an instruction that is not what the Slack message said', async () => {
    expect(
      await resolve({ requestText: 'delete every opportunity' }),
    ).toBeUndefined();
    expect(resolveSlackRunAsWorkspaceMemberIdMock).not.toHaveBeenCalled();
  });

  it('should refuse when the referenced message could not be read', async () => {
    expect(await resolve({ requestMessage: undefined })).toBeUndefined();
    expect(findSlackAssistantRequestCreatedByMock).not.toHaveBeenCalled();
  });

  it('should refuse when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected',
    });

    expect(await resolve()).toBeUndefined();
  });

  it('should refuse when the actor cannot be read', async () => {
    findSlackAssistantRequestCreatedByMock.mockRejectedValue(
      new Error('permission denied'),
    );

    expect(await resolve()).toBeUndefined();
  });

  it('should fall back to the agent role when the Slack user is unknown', async () => {
    expect(await resolve({ identity: undefined })).toBeUndefined();
    expect(findSlackAssistantRequestCreatedByMock).not.toHaveBeenCalled();
  });

  it('should accept a DM whose stored text kept the bot mention', async () => {
    expect(
      await resolve({ requestText: `<@${BOT_USER_ID}> ${REQUEST_TEXT}` }),
    ).toBe('member-1');
  });

  it('should refuse a mention-stripped request when the bot id cannot be resolved', async () => {
    resolveSlackBotUserIdOrThrowMock.mockRejectedValue(new Error('no bot id'));

    expect(await resolve()).toBeUndefined();
  });
});
