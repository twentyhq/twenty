import { afterEach, describe, expect, it } from 'vitest';

import { createSlackMessageTimestampSequence } from 'src/__tests__/utils/create-slack-message-timestamp-sequence.util';
import { requireDefinedOrThrow } from 'src/__tests__/utils/require-defined-or-throw.util';
import { setupSlackIntegrationTest } from 'src/__tests__/utils/setup-slack-integration-test.util';
import { SLACK_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/slack-assistant-failure-text';
import { SLACK_ASSISTANT_FEEDBACK_ACTION_ID } from 'src/logic-functions/constants/slack-assistant-feedback-action-id';
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

type WorkerEvent = Parameters<typeof slackAssistantWorkerHandler>[0];

describe('Slack assistant worker', () => {
  const { slack, appRuntime, coreClient, workspaceId } =
    setupSlackIntegrationTest();

  const createdRequestIds: string[] = [];
  const nextMessageTimestamp = createSlackMessageTimestampSequence(1);

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

    const createdRequest = requireDefinedOrThrow(
      mutationResult.createSlackAssistantRequest,
      'The created Slack Assistant Request was not returned by the Twenty API',
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

    return requireDefinedOrThrow(
      queryResult.slackAssistantRequest,
      'The Slack Assistant Request was not returned by the Twenty API',
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
    slack.addMessage({
      channelId: CHANNEL_ID,
      threadTimestamp: slackMessageTimestamp,
      userId: slack.botUserId,
      text: 'Acme has 2 open deals.\n\n_Answered in 4s_',
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

    // The thread is replayed as turns, the bot's own earlier reply as an
    // assistant turn without its footer, and the message that triggered this
    // run is left out of its own context.
    expect(appRuntime.lastAgentMessages).toEqual([
      { role: 'user', content: '<@U0COLLEAGUE>: good question' },
      { role: 'assistant', content: 'Acme has 2 open deals.' },
      {
        role: 'user',
        content: expect.stringContaining(
          'Ada asks from Slack:\nhow many open deals does Acme have?',
        ),
      },
    ]);
    // A request record the app did not write earns no run-as, so the agent
    // keeps its own role.
    const agentMessages = appRuntime.lastAgentMessages;
    const agentRuns = appRuntime.agentRuns;

    expect(agentMessages[agentMessages.length - 1]?.content).toContain(
      "You are answering with the app's own role",
    );
    expect(
      agentRuns[agentRuns.length - 1]?.runAsWorkspaceMemberId,
    ).toBeUndefined();

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
      // The feedback buttons carry the request record id, which is how a click
      // finds the answer it rates.
      expect.objectContaining({
        type: 'context_actions',
        block_id: request.id,
        elements: [
          expect.objectContaining({
            type: 'feedback_buttons',
            action_id: SLACK_ASSISTANT_FEEDBACK_ACTION_ID,
          }),
        ],
      }),
    ]);
    // Record links in the answer must not turn into Slack previews.
    expect(slack.lastCallTo('chat.postMessage')?.args).toEqual(
      expect.objectContaining({ unfurl_links: false, unfurl_media: false }),
    );

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
