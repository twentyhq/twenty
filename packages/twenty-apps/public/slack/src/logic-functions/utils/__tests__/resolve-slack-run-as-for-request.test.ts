import { type WebClient } from '@slack/web-api';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type SlackThreadMessage } from 'src/logic-functions/types/slack-thread-message.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackRunAsForRequest } from 'src/logic-functions/utils/resolve-slack-run-as-for-request';

const {
  findSlackAssistantRequestCreatedByMock,
  resolveSlackRunAsWorkspaceMemberIdMock,
} = vi.hoisted(() => ({
  findSlackAssistantRequestCreatedByMock: vi.fn(),
  resolveSlackRunAsWorkspaceMemberIdMock: vi.fn(),
}));

vi.mock(
  'src/logic-functions/data/find-slack-assistant-request-created-by',
  () => ({
    findSlackAssistantRequestCreatedBy: findSlackAssistantRequestCreatedByMock,
  }),
);

vi.mock(
  'src/logic-functions/utils/resolve-slack-run-as-workspace-member-id',
  () => ({
    resolveSlackRunAsWorkspaceMemberId: resolveSlackRunAsWorkspaceMemberIdMock,
  }),
);

const client = {} as CoreApiClient;
const slackClient = {} as WebClient;

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
    slackClient: WebClient | undefined;
    assistantBotUserId: string | undefined;
    threadMessages: SlackThreadMessage[];
    isDirectMessage: boolean;
  }> = {},
) =>
  resolveSlackRunAsForRequest({
    client,
    slackClient:
      'slackClient' in overrides ? overrides.slackClient : slackClient,
    assistantBotUserId:
      'assistantBotUserId' in overrides
        ? overrides.assistantBotUserId
        : BOT_USER_ID,
    identity: 'identity' in overrides ? overrides.identity : IDENTITY,
    requestId: 'request-1',
    requestText: overrides.requestText ?? REQUEST_TEXT,
    requestMessage:
      'requestMessage' in overrides
        ? overrides.requestMessage
        : MENTION_MESSAGE,
    threadMessages: overrides.threadMessages ?? [MENTION_MESSAGE],
    isDirectMessage: overrides.isDirectMessage ?? false,
  });

describe('resolveSlackRunAsForRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findSlackAssistantRequestCreatedByMock.mockResolvedValue({
      source: 'APPLICATION',
      workspaceMemberId: null,
    });
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
    expect(await resolve({ slackClient: undefined })).toBeUndefined();
    expect(findSlackAssistantRequestCreatedByMock).not.toHaveBeenCalled();
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

  it('should refuse a mention-stripped request when the bot id is unknown', async () => {
    expect(await resolve({ assistantBotUserId: undefined })).toBeUndefined();
  });

  const MENTIONLESS_MESSAGE: SlackThreadMessage = {
    ts: '1700000000.000200',
    user: SLACK_USER_ID,
    text: REQUEST_TEXT,
  };

  it('should refuse a channel message that never addressed the bot', async () => {
    expect(
      await resolve({
        requestMessage: MENTIONLESS_MESSAGE,
        threadMessages: [MENTIONLESS_MESSAGE],
      }),
    ).toBeUndefined();
    expect(findSlackAssistantRequestCreatedByMock).not.toHaveBeenCalled();
  });

  it('should accept a mentionless follow-up in a thread the assistant already replied in', async () => {
    expect(
      await resolve({
        requestMessage: MENTIONLESS_MESSAGE,
        threadMessages: [
          { ts: '1700000000.000100', user: BOT_USER_ID, text: 'Earlier answer' },
          MENTIONLESS_MESSAGE,
        ],
      }),
    ).toBe('member-1');
  });

  it('should not count an assistant reply that came after the message as addressing', async () => {
    expect(
      await resolve({
        requestMessage: MENTIONLESS_MESSAGE,
        threadMessages: [
          MENTIONLESS_MESSAGE,
          { ts: '1700000000.000300', user: BOT_USER_ID, text: 'Later answer' },
        ],
      }),
    ).toBeUndefined();
  });

  it('should accept a mentionless direct message', async () => {
    expect(
      await resolve({
        requestMessage: MENTIONLESS_MESSAGE,
        threadMessages: [MENTIONLESS_MESSAGE],
        isDirectMessage: true,
      }),
    ).toBe('member-1');
  });
});
