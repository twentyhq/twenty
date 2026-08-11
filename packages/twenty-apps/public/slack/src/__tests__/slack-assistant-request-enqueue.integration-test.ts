import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, describe, expect, it } from 'vitest';

import { SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type SlackEventsEnqueueResult } from 'src/logic-functions/types/slack-events-enqueue-result.type';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import {
  buildSlackEventCallbackBody,
  buildSlackMessageTimestamp,
  SLACK_TEST_BOT_USER_ID,
  SLACK_TEST_CHANNEL_ID,
  SLACK_TEST_USER_ID,
} from 'src/__tests__/utils/build-slack-event-body';
import {
  runFailingSlackLogicFunction,
  runSlackLogicFunction,
} from 'src/__tests__/utils/execute-slack-logic-function';
import {
  countSlackAssistantRequestsByMessage,
  createSlackAssistantRequestRecord,
  destroySlackAssistantRequestRecords,
  findSlackAssistantRequestByMessage,
} from 'src/__tests__/utils/slack-assistant-request-records';

const DIRECT_MESSAGE_CHANNEL_ID = 'D0TESTDM';

const enqueue = (body: SlackEventsRequestBody) =>
  runSlackLogicFunction<SlackEventsEnqueueResult>({
    universalIdentifier: SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
    payload: body as unknown as Record<string, unknown>,
  });

describe('Slack assistant request enqueue', () => {
  const client = new CoreApiClient();
  const createdRecordIds: string[] = [];

  const trackCreatedRecord = async ({
    slackChannelId,
    slackMessageTimestamp,
  }: {
    slackChannelId: string;
    slackMessageTimestamp: string;
  }) => {
    const record = await findSlackAssistantRequestByMessage(client, {
      slackChannelId,
      slackMessageTimestamp,
    });

    if (record) {
      createdRecordIds.push(record.id);
    }

    return record;
  };

  afterAll(async () => {
    await destroySlackAssistantRequestRecords(client, createdRecordIds);
  });

  it('should queue a mention as a request with the bot mention stripped', async () => {
    const slackMessageTimestamp = buildSlackMessageTimestamp();

    const result = await enqueue(
      buildSlackEventCallbackBody({
        event: {
          type: 'app_mention',
          channel: SLACK_TEST_CHANNEL_ID,
          channel_type: 'channel',
          user: SLACK_TEST_USER_ID,
          text: `<@${SLACK_TEST_BOT_USER_ID}>   how many   companies do we have?`,
          ts: slackMessageTimestamp,
        },
      }),
    );

    expect(result).toEqual({ ok: true });

    const record = await trackCreatedRecord({
      slackChannelId: SLACK_TEST_CHANNEL_ID,
      slackMessageTimestamp,
    });

    expect(record).toMatchObject({
      requestText: 'how many companies do we have?',
      name: 'how many companies do we have?',
      slackChannelType: 'channel',
      slackUserId: SLACK_TEST_USER_ID,
      slackMessageTimestamp,
    });
  });

  it('should queue a direct message as a request', async () => {
    const slackMessageTimestamp = buildSlackMessageTimestamp();

    const result = await enqueue(
      buildSlackEventCallbackBody({
        event: {
          type: 'message',
          channel: DIRECT_MESSAGE_CHANNEL_ID,
          channel_type: 'im',
          user: SLACK_TEST_USER_ID,
          text: 'create a company named Acme',
          ts: slackMessageTimestamp,
        },
      }),
    );

    expect(result).toEqual({ ok: true });

    const record = await trackCreatedRecord({
      slackChannelId: DIRECT_MESSAGE_CHANNEL_ID,
      slackMessageTimestamp,
    });

    expect(record).toMatchObject({
      requestText: 'create a company named Acme',
      slackChannelType: 'im',
    });
  });

  it('should not queue the same Slack message twice', async () => {
    const slackMessageTimestamp = buildSlackMessageTimestamp();

    const event = {
      type: 'app_mention' as const,
      channel: SLACK_TEST_CHANNEL_ID,
      channel_type: 'channel',
      user: SLACK_TEST_USER_ID,
      text: `<@${SLACK_TEST_BOT_USER_ID}> who owns Acme?`,
      ts: slackMessageTimestamp,
    };

    const firstResult = await enqueue(buildSlackEventCallbackBody({ event }));

    await trackCreatedRecord({
      slackChannelId: SLACK_TEST_CHANNEL_ID,
      slackMessageTimestamp,
    });

    // Slack retries the same event with a new event_id when the callback times
    // out, so deduplication has to key on the channel and message timestamp.
    const secondResult = await enqueue(buildSlackEventCallbackBody({ event }));

    expect(firstResult).toEqual({ ok: true });
    expect(secondResult).toEqual({
      ok: true,
      skipped: 'Slack message is already queued',
    });

    await expect(
      countSlackAssistantRequestsByMessage(client, {
        slackChannelId: SLACK_TEST_CHANNEL_ID,
        slackMessageTimestamp,
      }),
    ).resolves.toBe(1);
  });

  it('should keep the unique index on the Slack message as a last resort', async () => {
    const slackMessageTimestamp = buildSlackMessageTimestamp();

    const record = await createSlackAssistantRequestRecord(client, {
      name: 'a first request',
      slackChannelId: SLACK_TEST_CHANNEL_ID,
      slackMessageTimestamp,
      requestText: 'a first request',
    });

    createdRecordIds.push(record.id);

    await expect(
      createSlackAssistantRequestRecord(client, {
        name: 'a racing duplicate',
        slackChannelId: SLACK_TEST_CHANNEL_ID,
        slackMessageTimestamp,
        requestText: 'a racing duplicate',
      }),
    ).rejects.toThrow();
  });

  it('should ignore messages sent by a bot', async () => {
    const result = await enqueue(
      buildSlackEventCallbackBody({
        event: {
          type: 'message',
          channel: DIRECT_MESSAGE_CHANNEL_ID,
          channel_type: 'im',
          user: SLACK_TEST_USER_ID,
          bot_id: 'B0OTHERBOT',
          text: 'automated status update',
          ts: buildSlackMessageTimestamp(),
        },
      }),
    );

    expect(result).toEqual({
      ok: true,
      skipped: 'Not a plain user message',
    });
  });

  it('should ignore message edits and other subtypes', async () => {
    const result = await enqueue(
      buildSlackEventCallbackBody({
        event: {
          type: 'message',
          subtype: 'message_changed',
          channel: DIRECT_MESSAGE_CHANNEL_ID,
          channel_type: 'im',
          user: SLACK_TEST_USER_ID,
          text: 'edited question',
          ts: buildSlackMessageTimestamp(),
        },
      }),
    );

    expect(result).toEqual({
      ok: true,
      skipped: 'Not a plain user message',
    });
  });

  it('should ignore channel messages that do not mention the bot', async () => {
    const result = await enqueue(
      buildSlackEventCallbackBody({
        event: {
          type: 'message',
          channel: SLACK_TEST_CHANNEL_ID,
          channel_type: 'channel',
          user: SLACK_TEST_USER_ID,
          text: 'just chatting with the team',
          ts: buildSlackMessageTimestamp(),
        },
      }),
    );

    expect(result).toEqual({
      ok: true,
      skipped: 'Unhandled event type: message',
    });
  });

  it('should ignore thread follow-ups on threads the bot is not subscribed to', async () => {
    const result = await enqueue(
      buildSlackEventCallbackBody({
        event: {
          type: 'message',
          channel: SLACK_TEST_CHANNEL_ID,
          channel_type: 'channel',
          user: SLACK_TEST_USER_ID,
          text: 'and what about Acme?',
          thread_ts: buildSlackMessageTimestamp(),
          ts: buildSlackMessageTimestamp(),
        },
      }),
    );

    expect(result).toEqual({
      ok: true,
      skipped: 'Thread is not subscribed for unmentioned follow-ups',
    });
  });

  it('should release its reply claim when it cannot answer a mention with no question', async () => {
    const event = {
      type: 'app_mention' as const,
      channel: SLACK_TEST_CHANNEL_ID,
      channel_type: 'channel',
      user: SLACK_TEST_USER_ID,
      text: `<@${SLACK_TEST_BOT_USER_ID}>`,
      ts: buildSlackMessageTimestamp(),
    };

    const firstAttempt = await runFailingSlackLogicFunction({
      universalIdentifier: SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
      payload: buildSlackEventCallbackBody({ event }) as unknown as Record<
        string,
        unknown
      >,
    });

    expect(firstAttempt.errorMessage).toContain('Slack is not connected');

    // The claim taken before posting must be released on failure, otherwise the
    // hint would never be sent once Slack is reachable again.
    const secondAttempt = await runFailingSlackLogicFunction({
      universalIdentifier: SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
      payload: buildSlackEventCallbackBody({ event }) as unknown as Record<
        string,
        unknown
      >,
    });

    expect(secondAttempt.errorMessage).toContain('Slack is not connected');
  });

  it('should ignore a callback that carries no event', async () => {
    const result = await enqueue({
      type: 'event_callback',
      event_id: 'Ev0TESTNOEVENT',
    });

    expect(result).toEqual({ ok: true, skipped: 'Missing event payload' });
  });
});
