import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { SLACK_WEBHOOK_SECRET_ENV_VAR } from 'src/logic-functions/utils/get-slack-webhook-secret';
import { buildSlackEventsRoutePayload } from 'src/__tests__/utils/build-slack-events-route-payload';
import {
  buildSlackEventCallbackBody,
  buildSlackMessageTimestamp,
  SLACK_TEST_BOT_USER_ID,
  SLACK_TEST_CHANNEL_ID,
  SLACK_TEST_TEAM_ID,
  SLACK_TEST_USER_ID,
} from 'src/__tests__/utils/build-slack-event-body';
import {
  runFailingSlackLogicFunction,
  runSlackLogicFunction,
} from 'src/__tests__/utils/execute-slack-logic-function';
import {
  clearSlackServerVariable,
  findInstalledSlackApplication,
  setSlackServerVariable,
} from 'src/__tests__/utils/slack-application';

const SIGNING_SECRET = 'integration-test-signing-secret';

const FIVE_MINUTES_IN_SECONDS = 5 * 60;

const runEventsResolver = (payload: Record<string, unknown>) =>
  runSlackLogicFunction<Record<string, unknown>>({
    universalIdentifier: SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER,
    payload,
  });

const failEventsResolver = (payload: Record<string, unknown>) =>
  runFailingSlackLogicFunction({
    universalIdentifier: SLACK_EVENTS_ROUTE_UNIVERSAL_IDENTIFIER,
    payload,
  });

const buildMentionBody = () =>
  buildSlackEventCallbackBody({
    event: {
      type: 'app_mention',
      channel: SLACK_TEST_CHANNEL_ID,
      channel_type: 'channel',
      user: SLACK_TEST_USER_ID,
      text: `<@${SLACK_TEST_BOT_USER_ID}> how many companies do we have?`,
      ts: buildSlackMessageTimestamp(),
    },
  });

describe('Slack events resolver', () => {
  let applicationRegistrationId: string;

  beforeAll(async () => {
    const application = await findInstalledSlackApplication();

    if (!application.applicationRegistrationId) {
      throw new Error('The Slack app has no application registration');
    }

    applicationRegistrationId = application.applicationRegistrationId;
  });

  afterAll(async () => {
    await clearSlackServerVariable({
      applicationRegistrationId,
      key: SLACK_WEBHOOK_SECRET_ENV_VAR,
    });
  });

  describe('when the webhook secret is not configured', () => {
    beforeAll(async () => {
      await clearSlackServerVariable({
        applicationRegistrationId,
        key: SLACK_WEBHOOK_SECRET_ENV_VAR,
      });
    });

    it('should refuse to handle the callback', async () => {
      const { errorMessage } = await failEventsResolver(
        buildSlackEventsRoutePayload({
          body: buildMentionBody(),
          signingSecret: SIGNING_SECRET,
        }),
      );

      expect(errorMessage).toContain(
        'SLACK_WEBHOOK_SECRET application variable is not set',
      );
    });
  });

  describe('when the webhook secret is configured', () => {
    beforeAll(async () => {
      await setSlackServerVariable({
        applicationRegistrationId,
        key: SLACK_WEBHOOK_SECRET_ENV_VAR,
        value: SIGNING_SECRET,
      });
    });

    it('should answer the url_verification handshake', async () => {
      const result = await runEventsResolver(
        buildSlackEventsRoutePayload({
          body: { type: 'url_verification', challenge: 'a-slack-challenge' },
          signingSecret: SIGNING_SECRET,
        }),
      );

      expect(result).toMatchObject({ body: { challenge: 'a-slack-challenge' } });
    });

    it('should reject a callback signed with another secret', async () => {
      const { errorMessage } = await failEventsResolver(
        buildSlackEventsRoutePayload({
          body: buildMentionBody(),
          signingSecret: 'another-workspace-secret',
        }),
      );

      expect(errorMessage).toContain('Invalid Slack signature');
    });

    it('should reject a replayed callback', async () => {
      const { errorMessage } = await failEventsResolver(
        buildSlackEventsRoutePayload({
          body: buildMentionBody(),
          signingSecret: SIGNING_SECRET,
          timestampInSeconds:
            Math.floor(Date.now() / 1000) - FIVE_MINUTES_IN_SECONDS - 60,
        }),
      );

      expect(errorMessage).toContain('Invalid Slack signature');
    });

    it('should reject a callback without a signature header', async () => {
      const { errorMessage } = await failEventsResolver(
        buildSlackEventsRoutePayload({
          body: buildMentionBody(),
          signingSecret: SIGNING_SECRET,
          signature: '',
        }),
      );

      expect(errorMessage).toContain('Invalid Slack signature');
    });

    it('should refuse to verify a callback whose raw body was not forwarded', async () => {
      const { errorMessage } = await failEventsResolver(
        buildSlackEventsRoutePayload({
          body: buildMentionBody(),
          signingSecret: SIGNING_SECRET,
          omitRawBody: true,
        }),
      );

      expect(errorMessage).toContain('Raw request body was not forwarded');
    });

    it('should refuse to route an event from an unclaimed Slack team', async () => {
      const { errorMessage } = await failEventsResolver(
        buildSlackEventsRoutePayload({
          body: buildMentionBody(),
          signingSecret: SIGNING_SECRET,
        }),
      );

      expect(errorMessage).toContain(
        `No workspace has claimed Slack team ${SLACK_TEST_TEAM_ID}`,
      );
    });

    it('should refuse to route an event without a team', async () => {
      const body = buildMentionBody();

      const { errorMessage } = await failEventsResolver(
        buildSlackEventsRoutePayload({
          body: { ...body, team_id: undefined },
          signingSecret: SIGNING_SECRET,
        }),
      );

      expect(errorMessage).toContain('Slack event has no team_id');
    });
  });
});
