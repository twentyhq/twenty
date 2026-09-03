import { Response } from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildSlackAppHomeOpenedEventBody } from 'src/__tests__/utils/build-slack-app-home-opened-event-body.util';
import { buildSlackAppMentionEventBody } from 'src/__tests__/utils/build-slack-app-mention-event-body.util';
import { buildSlackMemberJoinedChannelEventBody } from 'src/__tests__/utils/build-slack-member-joined-channel-event-body.util';
import { buildSlackMessageEventBody } from 'src/__tests__/utils/build-slack-message-event-body.util';
import { buildSlackRoutePayload } from 'src/__tests__/utils/build-slack-route-payload.util';
import { createSlackMessageTimestampSequence } from 'src/__tests__/utils/create-slack-message-timestamp-sequence.util';
import { setupSlackIntegrationTest } from 'src/__tests__/utils/setup-slack-integration-test.util';
import {
  SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER,
  SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
  SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { SLACK_ASSISTANT_EMPTY_REQUEST_TEXT } from 'src/logic-functions/constants/slack-assistant-empty-request-text';
import { SLACK_ASSISTANT_EXPIRED_THREAD_TEXT } from 'src/logic-functions/constants/slack-assistant-expired-thread-text';
import { slackEventsResolverHandler } from 'src/logic-functions/slack-events-resolver';
import { enqueueSlackAssistantRequest } from 'src/logic-functions/utils/enqueue-slack-assistant-request';
import { getSlackEmptyRequestReplyKvKey } from 'src/logic-functions/utils/get-slack-empty-request-reply-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';
import { getSlackThreadKvKey } from 'src/logic-functions/utils/get-slack-thread-kv-key';

const CHANNEL_ID = 'C0INTEGRATION';
const DIRECT_MESSAGE_CHANNEL_ID = 'D0INTEGRATION';
const REQUESTER_USER_ID = 'U0REQUESTER';

type SlackAssistantRequestNode = {
  id: string;
  name?: string;
  status?: string;
  requestText?: string;
  slackChannelId?: string;
  slackChannelType?: string;
  slackThreadTimestamp?: string;
  slackUserId?: string;
};

describe('Slack inbound events', () => {
  const { slack, appRuntime, coreClient, workspaceId } =
    setupSlackIntegrationTest();

  const nextMessageTimestamp = createSlackMessageTimestampSequence(0);

  const claimSlackTeamForThisWorkspace = (): void => {
    appRuntime.seedKeyValue(
      getSlackTeamKvKey(slack.teamId),
      workspaceId,
      'SERVER',
    );
  };

  const findRequestByMessageTimestamp = async (
    slackMessageTimestamp: string,
  ): Promise<SlackAssistantRequestNode | undefined> => {
    const queryResult = await coreClient.query({
      slackAssistantRequests: {
        __args: {
          filter: { slackMessageTimestamp: { eq: slackMessageTimestamp } },
          first: 2,
        },
        edges: {
          node: {
            id: true,
            name: true,
            status: true,
            requestText: true,
            slackChannelId: true,
            slackChannelType: true,
            slackThreadTimestamp: true,
            slackUserId: true,
          },
        },
      },
    });

    const nodes: SlackAssistantRequestNode[] = (
      queryResult.slackAssistantRequests?.edges ?? []
    ).map((edge: { node: SlackAssistantRequestNode }) => edge.node);

    expect(nodes.length).toBeLessThanOrEqual(1);

    return nodes[0];
  };

  const destroyRequestsCreatedInTest = async (): Promise<void> => {
    const queryResult = await coreClient.query({
      slackAssistantRequests: {
        __args: {
          filter: {
            slackChannelId: { in: [CHANNEL_ID, DIRECT_MESSAGE_CHANNEL_ID] },
          },
        },
        edges: { node: { id: true } },
      },
    });

    for (const edge of queryResult.slackAssistantRequests?.edges ?? []) {
      await coreClient.mutation({
        destroySlackAssistantRequest: {
          __args: { id: edge.node.id },
          id: true,
        },
      });
    }
  };

  afterEach(async () => {
    await destroyRequestsCreatedInTest();
  });

  describe('events route', () => {
    it('should answer the url_verification handshake with the challenge', async () => {
      const result = await slackEventsResolverHandler(
        buildSlackRoutePayload({
          type: 'url_verification',
          challenge: 'challenge-token',
        }),
      );

      if (!(result instanceof Response)) {
        throw new Error('The handshake did not answer with an HTTP response');
      }

      expect(result.body).toEqual({ challenge: 'challenge-token' });
    });

    it('should reject a request that is not signed with the workspace signing secret', async () => {
      const routePayload = buildSlackRoutePayload(
        { type: 'url_verification', challenge: 'challenge-token' },
        { secret: 'another-signing-secret' },
      );

      await expect(slackEventsResolverHandler(routePayload)).rejects.toThrow(
        'Invalid Slack signature',
      );
    });

    it('should reject a replayed request signed more than five minutes ago', async () => {
      const routePayload = buildSlackRoutePayload(
        { type: 'url_verification', challenge: 'challenge-token' },
        { timestampSeconds: Math.floor(Date.now() / 1000) - 600 },
      );

      await expect(slackEventsResolverHandler(routePayload)).rejects.toThrow(
        'Invalid Slack signature',
      );
    });

    it('should reject a request whose body was tampered with after signing', async () => {
      const routePayload = buildSlackRoutePayload({
        type: 'url_verification',
        challenge: 'challenge-token',
      });

      await expect(
        slackEventsResolverHandler({
          ...routePayload,
          rawBody: '{"type":"url_verification","challenge":"stolen"}',
        }),
      ).rejects.toThrow('Invalid Slack signature');
    });

    it('should route a mention to the assistant enqueue function of the claiming workspace', async () => {
      claimSlackTeamForThisWorkspace();

      const result = await slackEventsResolverHandler(
        buildSlackRoutePayload(
          buildSlackAppMentionEventBody({
            channelId: CHANNEL_ID,
            text: 'hello',
            teamId: slack.teamId,
          }),
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          workspaceId,
          targetLogicFunctionUniversalIdentifier:
            SLACK_EVENTS_ENQUEUE_UNIVERSAL_IDENTIFIER,
        }),
      );
    });

    it('should route a channel join to the welcome function', async () => {
      claimSlackTeamForThisWorkspace();

      const result = await slackEventsResolverHandler(
        buildSlackRoutePayload(
          buildSlackMemberJoinedChannelEventBody({
            channelId: CHANNEL_ID,
            userId: slack.botUserId,
            teamId: slack.teamId,
          }),
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          targetLogicFunctionUniversalIdentifier:
            SLACK_CHANNEL_WELCOME_UNIVERSAL_IDENTIFIER,
        }),
      );
    });

    it('should route an app home opening to the suggested prompts function', async () => {
      claimSlackTeamForThisWorkspace();

      const result = await slackEventsResolverHandler(
        buildSlackRoutePayload(
          buildSlackAppHomeOpenedEventBody({
            channelId: DIRECT_MESSAGE_CHANNEL_ID,
            teamId: slack.teamId,
          }),
        ),
      );

      expect(result).toEqual(
        expect.objectContaining({
          targetLogicFunctionUniversalIdentifier:
            SLACK_HOME_OPENED_UNIVERSAL_IDENTIFIER,
        }),
      );
    });

    it('should refuse events from a Slack team no workspace has connected', async () => {
      const routePayload = buildSlackRoutePayload(
        buildSlackAppMentionEventBody({
          channelId: CHANNEL_ID,
          text: 'hello',
          teamId: 'T0UNCLAIMED',
        }),
      );

      await expect(slackEventsResolverHandler(routePayload)).rejects.toThrow(
        'No workspace has claimed Slack team T0UNCLAIMED',
      );
    });
  });

  describe('assistant request enqueue', () => {
    it('should queue a mention as a pending request without the bot mention', async () => {
      const slackMessageTimestamp = nextMessageTimestamp();

      const result = await enqueueSlackAssistantRequest(
        buildSlackAppMentionEventBody({
          channelId: CHANNEL_ID,
          text: `<@${slack.botUserId}> how many   companies do we have?`,
          messageTimestamp: slackMessageTimestamp,
          botUserId: slack.botUserId,
        }),
      );

      expect(result).toEqual({ ok: true });

      const request = await findRequestByMessageTimestamp(
        slackMessageTimestamp,
      );

      // The status is not asserted here: on a server running a worker, the
      // deployed assistant worker picks the record up right away.
      expect(request).toEqual(
        expect.objectContaining({
          name: 'how many companies do we have?',
          requestText: 'how many companies do we have?',
          slackChannelId: CHANNEL_ID,
          slackChannelType: 'channel',
          slackUserId: REQUESTER_USER_ID,
        }),
      );
    });

    it('should ignore a redelivery of the same Slack message', async () => {
      const slackMessageTimestamp = nextMessageTimestamp();
      const eventBody = buildSlackAppMentionEventBody({
        channelId: CHANNEL_ID,
        text: `<@${slack.botUserId}> who owns Acme?`,
        messageTimestamp: slackMessageTimestamp,
        botUserId: slack.botUserId,
      });

      await enqueueSlackAssistantRequest(eventBody);
      const redeliveryResult = await enqueueSlackAssistantRequest(eventBody);

      expect(redeliveryResult).toEqual({
        ok: true,
        skipped: 'Slack message is already queued',
      });
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeDefined();
    });

    it('should ignore messages posted by another bot', async () => {
      const slackMessageTimestamp = nextMessageTimestamp();

      const result = await enqueueSlackAssistantRequest(
        buildSlackMessageEventBody({
          channelId: DIRECT_MESSAGE_CHANNEL_ID,
          text: 'a bot is talking',
          messageTimestamp: slackMessageTimestamp,
          botId: 'B0OTHERBOT',
        }),
      );

      expect(result).toEqual({
        ok: true,
        skipped: 'Not a plain user message (bot_id=B0OTHERBOT)',
      });
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeUndefined();
    });

    it('should answer a mention with no question in Slack instead of queueing it', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'integration' });
      const slackMessageTimestamp = nextMessageTimestamp();

      const result = await enqueueSlackAssistantRequest(
        buildSlackAppMentionEventBody({
          channelId: CHANNEL_ID,
          text: `<@${slack.botUserId}>`,
          messageTimestamp: slackMessageTimestamp,
          botUserId: slack.botUserId,
        }),
      );

      expect(result).toEqual({ ok: true });
      expect(slack.messagesIn(CHANNEL_ID)).toEqual([
        expect.objectContaining({
          markdownText: SLACK_ASSISTANT_EMPTY_REQUEST_TEXT,
          threadTimestamp: slackMessageTimestamp,
        }),
      ]);
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeUndefined();
    });

    it('should answer an empty mention only once', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'integration' });
      const eventBody = buildSlackAppMentionEventBody({
        channelId: CHANNEL_ID,
        text: `<@${slack.botUserId}> `,
        messageTimestamp: nextMessageTimestamp(),
        botUserId: slack.botUserId,
      });

      await enqueueSlackAssistantRequest(eventBody);
      const secondResult = await enqueueSlackAssistantRequest(eventBody);

      expect(secondResult).toEqual({
        ok: true,
        skipped: 'Empty request was already answered',
      });
      expect(slack.messagesIn(CHANNEL_ID)).toHaveLength(1);
    });

    it('should ignore an unmentioned thread reply when the thread is not subscribed', async () => {
      const slackMessageTimestamp = nextMessageTimestamp();

      const result = await enqueueSlackAssistantRequest(
        buildSlackMessageEventBody({
          channelId: CHANNEL_ID,
          channelType: 'channel',
          text: 'and what about last month?',
          messageTimestamp: slackMessageTimestamp,
          threadTimestamp: '1700000000.000001',
        }),
      );

      expect(result).toEqual({
        ok: true,
        skipped: 'Thread is not subscribed for unmentioned follow-ups',
      });
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeUndefined();
    });

    it('should queue an unmentioned thread reply while the thread subscription is active', async () => {
      const threadTimestamp = '1700000000.000002';
      const slackMessageTimestamp = nextMessageTimestamp();

      appRuntime.seedKeyValue(
        getSlackThreadKvKey({
          channelId: CHANNEL_ID,
          threadTimestamp,
        }),
        { expiresAt: Date.now() + 60_000 },
      );

      const result = await enqueueSlackAssistantRequest(
        buildSlackMessageEventBody({
          channelId: CHANNEL_ID,
          channelType: 'channel',
          text: 'and what about last month?',
          messageTimestamp: slackMessageTimestamp,
          threadTimestamp,
        }),
      );

      expect(result).toEqual({ ok: true });

      const request = await findRequestByMessageTimestamp(
        slackMessageTimestamp,
      );

      expect(request).toEqual(
        expect.objectContaining({
          requestText: 'and what about last month?',
          slackThreadTimestamp: threadTimestamp,
        }),
      );
    });

    it('should discard an app-posted mention without touching anything', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'integration' });
      const slackMessageTimestamp = nextMessageTimestamp();

      const result = await enqueueSlackAssistantRequest(
        buildSlackAppMentionEventBody({
          channelId: CHANNEL_ID,
          text: `<@${slack.botUserId}> *Sent using* <@U0BKU1ME0PM>`,
          messageTimestamp: slackMessageTimestamp,
          botUserId: slack.botUserId,
          botId: 'B0POSTINGAPP',
        }),
      );

      expect(result).toEqual({
        ok: true,
        skipped: 'Not a plain user message (bot_id=B0POSTINGAPP)',
      });
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeUndefined();
      expect(slack.messagesIn(CHANNEL_ID)).toEqual([]);
      expect(
        appRuntime.getKeyValue(
          getSlackEmptyRequestReplyKvKey({
            slackChannelId: CHANNEL_ID,
            slackMessageTimestamp,
          }),
          'WORKSPACE',
        ),
      ).toBeNull();
      expect(
        appRuntime.getKeyValue(
          getSlackThreadKvKey({
            channelId: CHANNEL_ID,
            threadTimestamp: slackMessageTimestamp,
          }),
          'WORKSPACE',
        ),
      ).toBeNull();
    });

    it('should discard a mention carrying a message subtype', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'integration' });
      const slackMessageTimestamp = nextMessageTimestamp();

      const result = await enqueueSlackAssistantRequest(
        buildSlackAppMentionEventBody({
          channelId: CHANNEL_ID,
          text: `<@${slack.botUserId}> who owns Acme?`,
          messageTimestamp: slackMessageTimestamp,
          botUserId: slack.botUserId,
          subtype: 'bot_message',
        }),
      );

      expect(result).toEqual({
        ok: true,
        skipped: 'Not a plain user message (subtype=bot_message)',
      });
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeUndefined();
      expect(slack.messagesIn(CHANNEL_ID)).toEqual([]);
    });

    it('should name the discard reason in the logs so a dropped mention leaves a trace', async () => {
      const slackMessageTimestamp = nextMessageTimestamp();
      const warnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => undefined);

      try {
        await enqueueSlackAssistantRequest(
          buildSlackAppMentionEventBody({
            channelId: CHANNEL_ID,
            text: `<@${slack.botUserId}> who owns Acme?`,
            messageTimestamp: slackMessageTimestamp,
            eventId: 'Ev0DIAGNOSABLE',
            botUserId: slack.botUserId,
            botId: 'B0POSTINGAPP',
          }),
        );
      } finally {
        warnSpy.mockRestore();
      }

      expect(warnSpy).toHaveBeenCalledWith(
        `[slack] discarded event Ev0DIAGNOSABLE (app_mention) in ${CHANNEL_ID}:${slackMessageTimestamp}: Not a plain user message (bot_id=B0POSTINGAPP)`,
      );
    });

    // Removing the bot_id / subtype guard would let this through, and the
    // answer the bot posts renews the subscription that admitted it.
    it('should discard the assistant own reply inside a thread it subscribed', async () => {
      const threadTimestamp = '1700000000.000004';
      const slackMessageTimestamp = nextMessageTimestamp();

      appRuntime.seedKeyValue(
        getSlackThreadKvKey({ channelId: CHANNEL_ID, threadTimestamp }),
        { expiresAt: Date.now() + 60_000 },
      );

      const result = await enqueueSlackAssistantRequest(
        buildSlackMessageEventBody({
          channelId: CHANNEL_ID,
          channelType: 'channel',
          text: 'Acme is owned by Tim.',
          userId: slack.botUserId,
          messageTimestamp: slackMessageTimestamp,
          threadTimestamp,
          botId: 'B0TWENTYASSISTANT',
        }),
      );

      expect(result).toEqual({
        ok: true,
        skipped: 'Not a plain user message (bot_id=B0TWENTYASSISTANT)',
      });
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeUndefined();
    });

    it('should keep a single request when Slack delivers the same message twice at once', async () => {
      const slackMessageTimestamp = nextMessageTimestamp();
      const buildDelivery = (eventId: string) =>
        buildSlackAppMentionEventBody({
          channelId: CHANNEL_ID,
          text: `<@${slack.botUserId}> how many companies do we have?`,
          messageTimestamp: slackMessageTimestamp,
          eventId,
          botUserId: slack.botUserId,
        });

      const results = await Promise.all([
        enqueueSlackAssistantRequest(buildDelivery('Ev0FIRSTDELIVERY')),
        enqueueSlackAssistantRequest(buildDelivery('Ev0SLACKRETRY')),
      ]);

      expect(results.filter((result) => result.skipped === undefined)).toEqual([
        { ok: true },
      ]);
      expect(
        results.filter(
          (result) => result.skipped === 'Slack message is already queued',
        ),
      ).toHaveLength(1);

      // findRequestByMessageTimestamp asserts the unique index held.
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeDefined();
    });

    // A mention inside a subscribed thread is the one message Slack delivers
    // twice under the same ts: once as app_mention, once as message.
    it('should keep a single request when a mention in a subscribed thread arrives on both subscriptions', async () => {
      const threadTimestamp = '1700000000.000005';
      const slackMessageTimestamp = nextMessageTimestamp();
      const text = `<@${slack.botUserId}> and what about last month?`;

      appRuntime.seedKeyValue(
        getSlackThreadKvKey({ channelId: CHANNEL_ID, threadTimestamp }),
        { expiresAt: Date.now() + 60_000 },
      );

      const results = await Promise.all([
        enqueueSlackAssistantRequest(
          buildSlackAppMentionEventBody({
            channelId: CHANNEL_ID,
            text,
            messageTimestamp: slackMessageTimestamp,
            threadTimestamp,
            botUserId: slack.botUserId,
          }),
        ),
        enqueueSlackAssistantRequest(
          buildSlackMessageEventBody({
            channelId: CHANNEL_ID,
            channelType: 'channel',
            text,
            messageTimestamp: slackMessageTimestamp,
            threadTimestamp,
            botUserId: slack.botUserId,
          }),
        ),
      ]);

      expect(results.filter((result) => result.skipped === undefined)).toEqual([
        { ok: true },
      ]);
      expect(
        results.filter(
          (result) => result.skipped === 'Slack message is already queued',
        ),
      ).toHaveLength(1);
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeDefined();
    });

    it('should nudge the requester and drop the subscription when it has expired', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'integration' });
      const threadTimestamp = '1700000000.000003';
      const threadKey = getSlackThreadKvKey({
        channelId: CHANNEL_ID,
        threadTimestamp,
      });
      const slackMessageTimestamp = nextMessageTimestamp();

      appRuntime.seedKeyValue(threadKey, { expiresAt: Date.now() - 1 });

      const result = await enqueueSlackAssistantRequest(
        buildSlackMessageEventBody({
          channelId: CHANNEL_ID,
          channelType: 'channel',
          text: 'still there?',
          messageTimestamp: slackMessageTimestamp,
          threadTimestamp,
        }),
      );

      expect(result).toEqual({
        ok: true,
        skipped: 'Thread subscription expired; nudged the requester',
      });
      expect(slack.ephemeralMessages).toEqual([
        expect.objectContaining({
          channelId: CHANNEL_ID,
          recipientUserId: REQUESTER_USER_ID,
          threadTimestamp,
          text: SLACK_ASSISTANT_EXPIRED_THREAD_TEXT,
        }),
      ]);
      expect(appRuntime.getKeyValue(threadKey, 'WORKSPACE')).toBeNull();
      await expect(
        findRequestByMessageTimestamp(slackMessageTimestamp),
      ).resolves.toBeUndefined();
    });
  });
});
