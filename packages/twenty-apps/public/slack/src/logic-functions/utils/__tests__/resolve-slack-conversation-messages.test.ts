import { type CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SLACK_ASSISTANT_REQUEST_OUTCOME_LOOKUP_TIMEOUT_MS } from 'src/logic-functions/constants/slack-assistant-request-outcome-lookup-timeout-ms';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { resolveSlackConversationMessages } from 'src/logic-functions/utils/resolve-slack-conversation-messages';

const { findSlackAssistantRequestOutcomesBySlackMessagesMock } = vi.hoisted(
  () => ({
    findSlackAssistantRequestOutcomesBySlackMessagesMock: vi.fn(),
  }),
);

vi.mock(
  'src/logic-functions/data/find-slack-assistant-request-outcomes-by-slack-messages',
  () => ({
    findSlackAssistantRequestOutcomesBySlackMessages:
      findSlackAssistantRequestOutcomesBySlackMessagesMock,
  }),
);

const client = {} as CoreApiClient;
const ASSISTANT_BOT_USER_ID = 'U_ASSISTANT';

const RESOLVE_ARGS = {
  client,
  slackChannelId: 'C123',
  parentMessageTimestamp: '1',
  assistantBotUserId: ASSISTANT_BOT_USER_ID,
  conversationThreadMessages: [
    { ts: '1', user: 'U123', text: 'Who owns ACME?' },
    {
      ts: '2',
      user: ASSISTANT_BOT_USER_ID,
      bot_id: 'B1',
      text: 'Sarah owns it.',
    },
    { ts: '3', user: 'U456', text: 'They moved to London' },
  ],
};

describe('resolveSlackConversationMessages', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    findSlackAssistantRequestOutcomesBySlackMessagesMock.mockReset();
  });

  it('should look up the outcomes of the thread messages and forward what the agent has not seen', async () => {
    findSlackAssistantRequestOutcomesBySlackMessagesMock.mockResolvedValue(
      new Map([
        [
          '1',
          {
            status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
            responseText: 'Sarah owns it.',
          },
        ],
      ]),
    );

    const messages = await resolveSlackConversationMessages(RESOLVE_ARGS);

    expect(
      findSlackAssistantRequestOutcomesBySlackMessagesMock,
    ).toHaveBeenCalledWith(client, {
      slackChannelId: 'C123',
      slackMessageTimestamps: ['1', '2', '3'],
    });
    expect(messages).toEqual([
      { role: 'user', content: '<@U456>: They moved to London' },
    ]);
  });

  it('should answer without Slack context when the outcome lookup fails', async () => {
    findSlackAssistantRequestOutcomesBySlackMessagesMock.mockRejectedValue(
      new Error('network down'),
    );

    const messages = await resolveSlackConversationMessages(RESOLVE_ARGS);

    expect(messages).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('network down'),
    );
  });

  it('should answer without Slack context when the outcome lookup times out', async () => {
    vi.useFakeTimers();
    findSlackAssistantRequestOutcomesBySlackMessagesMock.mockReturnValue(
      new Promise(() => undefined),
    );

    const messagesPromise = resolveSlackConversationMessages(RESOLVE_ARGS);

    await vi.advanceTimersByTimeAsync(
      SLACK_ASSISTANT_REQUEST_OUTCOME_LOOKUP_TIMEOUT_MS,
    );

    await expect(messagesPromise).resolves.toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('timed out'),
    );
  });
});
