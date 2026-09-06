import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_CONTEXT_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-context-timeout-ms';
import { fetchSlackAssistantContext } from 'src/logic-functions/utils/fetch-slack-assistant-context';

const {
  getSlackClientMock,
  resolveSlackBotUserIdOrThrowMock,
  fetchSlackThreadMessagesMock,
  fetchSlackUserIdentityMock,
  isSlackDirectMessageChannelMock,
} = vi.hoisted(() => ({
  getSlackClientMock: vi.fn(),
  resolveSlackBotUserIdOrThrowMock: vi.fn(),
  fetchSlackThreadMessagesMock: vi.fn(),
  fetchSlackUserIdentityMock: vi.fn(),
  isSlackDirectMessageChannelMock: vi.fn(),
}));

vi.mock('src/logic-functions/utils/get-slack-client', () => ({
  getSlackClient: getSlackClientMock,
}));

vi.mock('src/logic-functions/utils/resolve-slack-bot-user-id-or-throw', () => ({
  resolveSlackBotUserIdOrThrow: resolveSlackBotUserIdOrThrowMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-thread-messages', () => ({
  fetchSlackThreadMessages: fetchSlackThreadMessagesMock,
}));

vi.mock('src/logic-functions/utils/fetch-slack-user-identity', () => ({
  fetchSlackUserIdentity: fetchSlackUserIdentityMock,
}));

vi.mock('src/logic-functions/utils/is-slack-direct-message-channel', () => ({
  isSlackDirectMessageChannel: isSlackDirectMessageChannelMock,
}));

const SLACK_CLIENT = { chat: {} };

const CONTEXT_ARGS = {
  slackChannelId: 'C123',
  parentMessageTimestamp: '1700000000.000100',
  slackMessageTimestamp: '1700000000.000200',
  slackUserId: 'U123',
};

describe('fetchSlackAssistantContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    getSlackClientMock.mockResolvedValue({
      success: true,
      client: SLACK_CLIENT,
    });
    resolveSlackBotUserIdOrThrowMock.mockResolvedValue('UBOT');
    fetchSlackThreadMessagesMock.mockResolvedValue({
      tailMessages: [{ ts: '1700000000.000100', text: 'hello', user: 'U123' }],
      requestMessage: { ts: '1700000000.000200', text: 'hi', user: 'U123' },
    });
    fetchSlackUserIdentityMock.mockResolvedValue({
      slackUserId: 'U123',
      displayName: 'Ada',
    });
    isSlackDirectMessageChannelMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return the thread context when Slack answers in time', async () => {
    const context = await fetchSlackAssistantContext(CONTEXT_ARGS);

    expect(context.requesterName).toBe('Ada');
    expect(context.assistantBotUserId).toBe('UBOT');
    expect(context.isDirectMessage).toBe(true);
    expect(context.slackClient).toBe(SLACK_CLIENT);
    expect(context.threadMessages).toHaveLength(1);
  });

  it('should give up on a slow Slack read instead of spending the agent budget', async () => {
    vi.useFakeTimers();
    fetchSlackThreadMessagesMock.mockReturnValue(new Promise(() => undefined));

    const contextPromise = fetchSlackAssistantContext(CONTEXT_ARGS);

    await vi.advanceTimersByTimeAsync(SLACK_ASSISTANT_CONTEXT_TIMEOUT_MS);

    const context = await contextPromise;

    expect(context.threadMessages).toEqual([]);
    expect(context.conversationMessages).toEqual([]);
    expect(context.requesterName).toBeUndefined();
    expect(context.isDirectMessage).toBe(false);
    expect(context.slackClient).toBe(SLACK_CLIENT);
  });

  it('should give up when acquiring the Slack client hangs', async () => {
    vi.useFakeTimers();
    getSlackClientMock.mockReturnValue(new Promise(() => undefined));

    const contextPromise = fetchSlackAssistantContext(CONTEXT_ARGS);

    await vi.advanceTimersByTimeAsync(SLACK_ASSISTANT_CONTEXT_TIMEOUT_MS);

    const context = await contextPromise;

    expect(context.slackClient).toBeUndefined();
    expect(context.threadMessages).toEqual([]);
  });

  it('should return an unreachable context when Slack is not connected', async () => {
    getSlackClientMock.mockResolvedValue({
      success: false,
      error: 'Slack is not connected',
    });

    const context = await fetchSlackAssistantContext(CONTEXT_ARGS);

    expect(context.slackClient).toBeUndefined();
    expect(context.threadMessages).toEqual([]);
    expect(fetchSlackThreadMessagesMock).not.toHaveBeenCalled();
  });
});
