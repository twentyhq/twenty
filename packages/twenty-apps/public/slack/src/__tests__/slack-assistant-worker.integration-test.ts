import { afterEach, describe, expect, it } from 'vitest';

import { setupSlackIntegrationTest } from 'src/__tests__/utils/setup-slack-integration-test';
import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { SLACK_ASSISTANT_INITIAL_STATUS } from 'src/logic-functions/constants/slack-assistant-status-steps';
import { SLACK_MARKDOWN_BLOCK_MAX_LENGTH } from 'src/logic-functions/constants/slack-markdown-block-max-length';
import { slackAssistantWorkerHandler } from 'src/logic-functions/slack-assistant-worker';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

const CHANNEL_ID = 'C0WORKERTEST';
const DIRECT_MESSAGE_CHANNEL_ID = 'D0WORKERTEST';
const REQUESTER_USER_ID = 'U0REQUESTER';

type SlackAssistantRequestStatus =
  (typeof SLACK_ASSISTANT_REQUEST_STATUS)[keyof typeof SLACK_ASSISTANT_REQUEST_STATUS];

type SlackAssistantRequestRecordFields = {
  id?: string;
  status?: string | null;
  requestText?: string | null;
  responseText?: string | null;
  errorMessage?: string | null;
};

const requireRecord = <TRecord>(
  record: TRecord | undefined,
  what: string,
): TRecord => {
  if (record === undefined) {
    throw new Error(`${what} was not returned by the Twenty API`);
  }

  return record;
};

type WorkerEvent = Parameters<typeof slackAssistantWorkerHandler>[0];

describe('Slack assistant worker', () => {
  const { slack, appRuntime, coreClient, workspaceId } =
    setupSlackIntegrationTest();

  const createdRequestIds: string[] = [];
  let messageTimestampSequence = 0;

  const nextMessageTimestamp = (): string => {
    messageTimestampSequence += 1;

    return `1700001${String(Date.now()).slice(-3)}.${String(
      messageTimestampSequence,
    ).padStart(6, '0')}`;
  };

  // Records are stored as PROCESSING so that the deployed worker on the test
  // server leaves them alone; the handler under test gets its PENDING record
  // from the database event payload, exactly like the real trigger does.
  const createRequestRecord = async (fields: {
    slackChannelId: string;
    slackMessageTimestamp: string;
    requestText: string;
    slackChannelType?: string;
    slackThreadTimestamp?: string;
  }): Promise<{ id: string }> => {
    const mutationResult = await coreClient.mutation({
      createSlackAssistantRequest: {
        __args: {
          data: {
            name: fields.requestText,
            status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
            slackChannelType: 'channel',
            slackThreadTimestamp: '',
            slackUserId: REQUESTER_USER_ID,
            slackEventId: `Ev${fields.slackMessageTimestamp}`,
            ...fields,
          },
        },
        id: true,
      },
    });

    const createdRequest = requireRecord(
      mutationResult.createSlackAssistantRequest,
      'The created Slack Assistant Request',
    );

    createdRequestIds.push(createdRequest.id);

    return createdRequest;
  };

  const readRequest = async (
    requestId: string,
  ): Promise<SlackAssistantRequestRecordFields> => {
    const queryResult = await coreClient.query({
      slackAssistantRequest: {
        __args: { filter: { id: { eq: requestId } } },
        id: true,
        status: true,
        requestText: true,
        responseText: true,
        errorMessage: true,
      },
    });

    return requireRecord(
      queryResult.slackAssistantRequest,
      'The Slack Assistant Request',
    );
  };

  // The worker only reads `properties.after`; the surrounding database event
  // metadata is irrelevant to its behavior.
  const buildRequestCreatedEvent = (record: {
    id: string;
    slackChannelId: string;
    slackMessageTimestamp: string;
    requestText: string;
    slackChannelType?: string;
    slackThreadTimestamp?: string;
    status?: SlackAssistantRequestStatus;
  }): WorkerEvent =>
    ({
      name: 'slackAssistantRequest.created',
      workspaceId,
      properties: {
        after: {
          status: SLACK_ASSISTANT_REQUEST_STATUS.PENDING,
          slackChannelType: 'channel',
          slackThreadTimestamp: '',
          slackUserId: REQUESTER_USER_ID,
          ...record,
        },
      },
    }) as unknown as WorkerEvent;

  afterEach(async () => {
    for (const requestId of createdRequestIds) {
      await coreClient.mutation({
        destroySlackAssistantRequest: { __args: { id: requestId }, id: true },
      });
    }

    createdRequestIds.length = 0;
  });

  it('should answer a channel request in its thread, store the answer and subscribe the thread', async () => {
    slack.addChannel({ id: CHANNEL_ID, name: 'sales' });
    slack.addUser({ id: REQUESTER_USER_ID, displayName: 'Ada' });
    const slackMessageTimestamp = nextMessageTimestamp();

    slack.addMessage({
      channelId: CHANNEL_ID,
      timestamp: slackMessageTimestamp,
      userId: REQUESTER_USER_ID,
      text: 'how many open deals does Acme have?',
    });
    slack.addMessage({
      channelId: CHANNEL_ID,
      threadTimestamp: slackMessageTimestamp,
      userId: 'U0COLLEAGUE',
      text: 'good question',
    });

    appRuntime.setAgentResult({
      success: true,
      result: { response: 'Acme has 3 open deals.' },
      error: null,
    });

    const request = await createRequestRecord({
      slackChannelId: CHANNEL_ID,
      slackMessageTimestamp,
      requestText: 'how many open deals does Acme have?',
    });

    const result = await slackAssistantWorkerHandler(
      buildRequestCreatedEvent({
        ...request,
        slackChannelId: CHANNEL_ID,
        slackMessageTimestamp,
        requestText: 'how many open deals does Acme have?',
      }),
    );

    expect(result).toEqual({ done: true });

    expect(appRuntime.lastAgentPrompt).toContain(
      'Ada asks from Slack:\nhow many open deals does Acme have?',
    );
    expect(appRuntime.lastAgentPrompt).toContain(
      '<@U0COLLEAGUE>: good question',
    );
    // The message that triggered the run is excluded from its own context.
    expect(appRuntime.lastAgentPrompt).not.toContain(
      '<@U0REQUESTER>: how many open deals does Acme have?',
    );

    expect(slack.assistantStatuses).toEqual([
      {
        channelId: CHANNEL_ID,
        threadTimestamp: slackMessageTimestamp,
        status: SLACK_ASSISTANT_INITIAL_STATUS,
      },
    ]);

    const postedAnswer = slack
      .messagesIn(CHANNEL_ID)
      .find(
        (message) =>
          message.threadTimestamp === slackMessageTimestamp &&
          message.botId !== undefined &&
          message.blocks !== undefined,
      );

    expect(postedAnswer?.blocks).toEqual([
      { type: 'markdown', text: 'Acme has 3 open deals.' },
      {
        type: 'context',
        elements: [
          { type: 'mrkdwn', text: expect.stringMatching(/^Answered in \d+s$/) },
        ],
      },
    ]);

    await expect(readRequest(request.id)).resolves.toEqual(
      expect.objectContaining({
        status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
        responseText: 'Acme has 3 open deals.',
      }),
    );

    expect(
      appRuntime.getKeyValue(
        getSlackThreadKvKey({
          channelId: CHANNEL_ID,
          threadTimestamp: slackMessageTimestamp,
        }),
        'WORKSPACE',
      ),
    ).toEqual({ expiresAt: expect.any(Number) });
  });

  it('should title the assistant thread of a first direct message instead of subscribing it', async () => {
    slack.addChannel({ id: DIRECT_MESSAGE_CHANNEL_ID, name: 'twenty' });
    const slackMessageTimestamp = nextMessageTimestamp();

    const request = await createRequestRecord({
      slackChannelId: DIRECT_MESSAGE_CHANNEL_ID,
      slackChannelType: 'im',
      slackMessageTimestamp,
      requestText: 'list my tasks for today',
    });

    await slackAssistantWorkerHandler(
      buildRequestCreatedEvent({
        ...request,
        slackChannelId: DIRECT_MESSAGE_CHANNEL_ID,
        slackChannelType: 'im',
        slackMessageTimestamp,
        requestText: 'list my tasks for today',
      }),
    );

    expect(slack.assistantTitles).toEqual([
      {
        channelId: DIRECT_MESSAGE_CHANNEL_ID,
        threadTimestamp: slackMessageTimestamp,
        title: 'list my tasks for today',
      },
    ]);
    expect(
      appRuntime.getKeyValue(
        getSlackThreadKvKey({
          channelId: DIRECT_MESSAGE_CHANNEL_ID,
          threadTimestamp: slackMessageTimestamp,
        }),
        'WORKSPACE',
      ),
    ).toBeNull();
  });

  it('should post the failure notice and fail the request when the agent errors', async () => {
    slack.addChannel({ id: CHANNEL_ID, name: 'sales' });
    const slackMessageTimestamp = nextMessageTimestamp();

    appRuntime.setAgentResult({
      success: false,
      result: null,
      error: 'Agent is not available',
    });

    const request = await createRequestRecord({
      slackChannelId: CHANNEL_ID,
      slackMessageTimestamp,
      requestText: 'who owns Acme?',
    });

    const result = await slackAssistantWorkerHandler(
      buildRequestCreatedEvent({
        ...request,
        slackChannelId: CHANNEL_ID,
        slackMessageTimestamp,
        requestText: 'who owns Acme?',
      }),
    );

    expect(result).toEqual({
      failed: true,
      reason: 'Agent is not available',
    });
    expect(slack.messagesIn(CHANNEL_ID)).toEqual([
      expect.objectContaining({
        text: SLACK_ASSISTANT_FAILURE_TEXT,
        threadTimestamp: slackMessageTimestamp,
      }),
    ]);
    await expect(readRequest(request.id)).resolves.toEqual(
      expect.objectContaining({
        status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
        errorMessage: 'Agent is not available',
      }),
    );
  });

  it('should fail the request when Slack refuses to deliver the answer', async () => {
    slack.addChannel({ id: CHANNEL_ID, name: 'sales' });
    slack.failNextCall('chat.postMessage', 'channel_not_found');
    const slackMessageTimestamp = nextMessageTimestamp();

    const request = await createRequestRecord({
      slackChannelId: CHANNEL_ID,
      slackMessageTimestamp,
      requestText: 'summarize the Acme thread',
    });

    const result = await slackAssistantWorkerHandler(
      buildRequestCreatedEvent({
        ...request,
        slackChannelId: CHANNEL_ID,
        slackMessageTimestamp,
        requestText: 'summarize the Acme thread',
      }),
    );

    expect(result).toEqual({
      failed: true,
      reason: expect.stringContaining('Could not deliver Slack answer'),
    });
    await expect(readRequest(request.id)).resolves.toEqual(
      expect.objectContaining({
        status: SLACK_ASSISTANT_REQUEST_STATUS.FAILED,
      }),
    );
  });

  it('should send a long answer as markdown text because Slack blocks cannot hold it', async () => {
    slack.addChannel({ id: CHANNEL_ID, name: 'sales' });
    const slackMessageTimestamp = nextMessageTimestamp();
    const longResponse = 'a'.repeat(SLACK_MARKDOWN_BLOCK_MAX_LENGTH + 1);

    appRuntime.setAgentResult({
      success: true,
      result: { response: longResponse },
      error: null,
    });

    const request = await createRequestRecord({
      slackChannelId: CHANNEL_ID,
      slackMessageTimestamp,
      requestText: 'give me the full account history',
    });

    await slackAssistantWorkerHandler(
      buildRequestCreatedEvent({
        ...request,
        slackChannelId: CHANNEL_ID,
        slackMessageTimestamp,
        requestText: 'give me the full account history',
      }),
    );

    const channelMessages = slack.messagesIn(CHANNEL_ID);
    const postedAnswer = channelMessages[channelMessages.length - 1];

    expect(postedAnswer?.blocks).toBeUndefined();
    expect(postedAnswer?.markdownText).toContain(longResponse);
  });

  it('should skip a request that another worker already picked up', async () => {
    const slackMessageTimestamp = nextMessageTimestamp();

    const result = await slackAssistantWorkerHandler(
      buildRequestCreatedEvent({
        id: 'not-persisted',
        status: SLACK_ASSISTANT_REQUEST_STATUS.PROCESSING,
        slackChannelId: CHANNEL_ID,
        slackMessageTimestamp,
        requestText: 'anything',
      }),
    );

    expect(result).toEqual({
      skipped: true,
      reason: 'Request is not pending',
    });
    expect(slack.calls).toHaveLength(0);
  });
});
