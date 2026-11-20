import { isDefined } from 'twenty-sdk/utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSlackAssistantRequestRecord } from 'src/__tests__/utils/create-slack-assistant-request-record.util';
import { readSlackAssistantRequestRecord } from 'src/__tests__/utils/read-slack-assistant-request-record.util';
import { setupSlackIntegrationTest } from 'src/__tests__/utils/setup-slack-integration-test.util';
import { SLACK_ASSISTANT_INTERRUPTED_ERROR } from 'src/logic-functions/constants/slack-assistant-interrupted-error';
import { SLACK_ASSISTANT_INTERRUPTED_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-interrupted-failure-text';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS } from 'src/logic-functions/constants/slack-assistant-request-watchdog-delay-seconds';
import { slackAssistantRequestWatchdogHandler } from 'src/logic-functions/handlers/slack-assistant-request-watchdog-handler';

const CHANNEL_ID = 'C0WATCHDOGTEST';
const REQUESTER_USER_ID = 'U0REQUESTER';
const MESSAGE_TIMESTAMP = '1700000900.000100';

describe('Slack assistant request watchdog', () => {
  const { slack, coreClient } = setupSlackIntegrationTest();

  let requestId: string | undefined;

  const botMessages = () =>
    slack.messagesIn(CHANNEL_ID).filter((message) => isDefined(message.botId));

  const runWatchdogWhenItFires = async (slackAssistantRequestId: string) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(
      Date.now() + SLACK_ASSISTANT_REQUEST_WATCHDOG_DELAY_SECONDS * 1000,
    );

    try {
      return await slackAssistantRequestWatchdogHandler({
        slackAssistantRequestId,
      });
    } finally {
      vi.useRealTimers();
    }
  };

  afterEach(async () => {
    if (isDefined(requestId)) {
      await coreClient.mutation({
        destroySlackAssistantRequest: { __args: { id: requestId }, id: true },
      });
    }

    requestId = undefined;
  });

  it('should fail a request left processing by a dead execution and tell the member to ask again', async () => {
    slack.addChannel({ id: CHANNEL_ID, name: 'sales' });
    slack.addMessage({
      channelId: CHANNEL_ID,
      timestamp: MESSAGE_TIMESTAMP,
      userId: REQUESTER_USER_ID,
      text: `<@${slack.botUserId}> who owns Acme?`,
    });

    const request = await createSlackAssistantRequestRecord({
      coreClient,
      draft: {
        slackChannelId: CHANNEL_ID,
        slackMessageTimestamp: MESSAGE_TIMESTAMP,
        slackUserId: REQUESTER_USER_ID,
        requestText: 'who owns Acme?',
        status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
      },
    });

    requestId = request.id;

    const result = await runWatchdogWhenItFires(request.id);

    expect(result).toEqual({ isFailed: true, attempt: 1, hasReplied: true });
    expect(botMessages()).toEqual([
      expect.objectContaining({
        text: SLACK_ASSISTANT_INTERRUPTED_FAILURE_TEXT,
        threadTimestamp: MESSAGE_TIMESTAMP,
      }),
    ]);
    expect(slack.assistantStatuses).toEqual([
      {
        channelId: CHANNEL_ID,
        threadTimestamp: MESSAGE_TIMESTAMP,
        status: '',
      },
    ]);
    await expect(
      readSlackAssistantRequestRecord({ coreClient, id: request.id }),
    ).resolves.toEqual(
      expect.objectContaining({
        status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
        errorMessage: SLACK_ASSISTANT_INTERRUPTED_ERROR,
      }),
    );

    const secondResult = await runWatchdogWhenItFires(request.id);

    expect(secondResult).toMatchObject({
      isFailed: false,
      isRescheduled: false,
    });
    expect(botMessages()).toHaveLength(1);
  });
});
