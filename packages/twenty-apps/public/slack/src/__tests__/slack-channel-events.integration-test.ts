import { describe, expect, it } from 'vitest';

import {
  SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER,
  SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import {
  buildSlackEventCallbackBody,
  SLACK_TEST_BOT_USER_ID,
  SLACK_TEST_CHANNEL_ID,
  SLACK_TEST_USER_ID,
} from 'src/__tests__/utils/build-slack-event-body';
import {
  runFailingSlackLogicFunction,
  runSlackLogicFunction,
} from 'src/__tests__/utils/execute-slack-logic-function';

type SkippableResult = { ok: boolean; skipped?: string };

const runChannelWelcome = (body: SlackEventsRequestBody) =>
  runSlackLogicFunction<SkippableResult>({
    universalIdentifier: SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER,
    payload: body as unknown as Record<string, unknown>,
  });

const runHomeOpened = (body: SlackEventsRequestBody) =>
  runSlackLogicFunction<SkippableResult>({
    universalIdentifier: SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER,
    payload: body as unknown as Record<string, unknown>,
  });

describe('Slack channel welcome', () => {
  it('should ignore a body that is not an event callback', async () => {
    await expect(
      runChannelWelcome({ type: 'url_verification', challenge: 'abc' }),
    ).resolves.toEqual({
      ok: true,
      skipped: 'Unhandled body type: url_verification',
    });
  });

  it('should ignore events other than a channel join', async () => {
    await expect(
      runChannelWelcome(
        buildSlackEventCallbackBody({
          event: {
            type: 'message',
            channel: SLACK_TEST_CHANNEL_ID,
            user: SLACK_TEST_USER_ID,
          },
        }),
      ),
    ).resolves.toEqual({ ok: true, skipped: 'Unhandled event type: message' });
  });

  it('should ignore a channel join without a channel', async () => {
    await expect(
      runChannelWelcome(
        buildSlackEventCallbackBody({
          event: { type: 'member_joined_channel', user: SLACK_TEST_BOT_USER_ID },
        }),
      ),
    ).resolves.toEqual({
      ok: true,
      skipped: 'Event is missing required fields',
    });
  });

  it('should fail loudly when it cannot tell whether the bot joined', async () => {
    const { errorMessage } = await runFailingSlackLogicFunction({
      universalIdentifier: SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER,
      payload: buildSlackEventCallbackBody({
        event: {
          type: 'member_joined_channel',
          channel: SLACK_TEST_CHANNEL_ID,
          user: SLACK_TEST_BOT_USER_ID,
        },
      }) as unknown as Record<string, unknown>,
    });

    expect(errorMessage).toContain('Slack is not connected');
  });
});

describe('Slack app home opened', () => {
  it('should only answer the messages tab', async () => {
    await expect(
      runHomeOpened(
        buildSlackEventCallbackBody({
          event: {
            type: 'app_home_opened',
            tab: 'home',
            channel: SLACK_TEST_CHANNEL_ID,
            user: SLACK_TEST_USER_ID,
          },
        }),
      ),
    ).resolves.toEqual({ ok: true, skipped: 'Unhandled app home tab: home' });
  });

  it('should ignore an event without a channel', async () => {
    await expect(
      runHomeOpened(
        buildSlackEventCallbackBody({
          event: {
            type: 'app_home_opened',
            tab: 'messages',
            user: SLACK_TEST_USER_ID,
          },
        }),
      ),
    ).resolves.toEqual({
      ok: true,
      skipped: 'Event is missing required fields',
    });
  });

  it('should fail loudly when the suggested prompts cannot be set', async () => {
    const { errorMessage } = await runFailingSlackLogicFunction({
      universalIdentifier: SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER,
      payload: buildSlackEventCallbackBody({
        event: {
          type: 'app_home_opened',
          tab: 'messages',
          channel: SLACK_TEST_CHANNEL_ID,
          user: SLACK_TEST_USER_ID,
        },
      }) as unknown as Record<string, unknown>,
    });

    expect(errorMessage).toContain('Slack is not connected');
  });
});
