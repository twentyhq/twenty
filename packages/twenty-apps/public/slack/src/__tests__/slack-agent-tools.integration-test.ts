import { type RoutePayload } from 'twenty-sdk/define';
import { describe, expect, it } from 'vitest';

import { setupSlackIntegrationTest } from 'src/__tests__/utils/setup-slack-integration-test';
import { slackAddReactionHandler } from 'src/logic-functions/handlers/slack-add-reaction-handler';
import { slackDeleteMessageHandler } from 'src/logic-functions/handlers/slack-delete-message-handler';
import { slackListChannelsHandler } from 'src/logic-functions/handlers/slack-list-channels-handler';
import { slackPostEphemeralMessageHandler } from 'src/logic-functions/handlers/slack-post-ephemeral-message-handler';
import { slackPostMessageHandler } from 'src/logic-functions/handlers/slack-post-message-handler';
import { slackUpdateMessageHandler } from 'src/logic-functions/handlers/slack-update-message-handler';
import slackListChannelsRoute from 'src/logic-functions/slack-list-channels-route';
import slackPostMessageRoute from 'src/logic-functions/slack-post-message-route';

const CHANNEL_ID = 'C0TOOLTEST';

const buildHttpRoutePayload = (
  overrides: Partial<RoutePayload> = {},
): RoutePayload => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body: null,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/slack/messages' } },
  userWorkspaceId: 'user-workspace-1',
  ...overrides,
});

describe('Slack agent tools', () => {
  const { slack, appRuntime } = setupSlackIntegrationTest();

  describe('post message', () => {
    it('should post a markdown message in a thread', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });

      const result = await slackPostMessageHandler({
        slackChannelId: CHANNEL_ID,
        messageText: '**Deal closed**',
        messageFormat: 'markdown',
        parentMessageTimestamp: '1700000000.000100',
      });

      expect(result).toEqual(
        expect.objectContaining({ success: true, channel: CHANNEL_ID }),
      );
      expect(slack.messagesIn(CHANNEL_ID)).toEqual([
        expect.objectContaining({
          markdownText: '**Deal closed**',
          threadTimestamp: '1700000000.000100',
        }),
      ]);
    });

    it('should retry as plain text in a workspace that rejects markdown_text', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });
      slack.rejectMarkdownText();

      const result = await slackPostMessageHandler({
        slackChannelId: CHANNEL_ID,
        messageText: '**Deal closed**',
        messageFormat: 'markdown',
      });

      expect(result.success).toBe(true);
      expect(slack.callsTo('chat.postMessage')).toHaveLength(2);
      expect(slack.messagesIn(CHANNEL_ID)).toEqual([
        expect.objectContaining({ text: '**Deal closed**' }),
      ]);
    });

    it('should report the Slack error when the channel does not exist', async () => {
      const result = await slackPostMessageHandler({
        slackChannelId: 'C0MISSING',
        messageText: 'hello',
      });

      expect(result).toEqual({
        success: false,
        message: 'Failed to post Slack message',
        error: 'An API error occurred: channel_not_found',
      });
    });
  });

  describe('update and delete message', () => {
    it('should update an existing message', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });
      const message = slack.addMessage({
        channelId: CHANNEL_ID,
        text: 'first draft',
      });

      const result = await slackUpdateMessageHandler({
        slackChannelId: CHANNEL_ID,
        messageTimestamp: message.timestamp,
        newMessageText: 'final wording',
      });

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Slack message updated.',
        }),
      );
      expect(slack.messagesIn(CHANNEL_ID)).toEqual([
        expect.objectContaining({ text: 'final wording' }),
      ]);
    });

    it('should delete an existing message', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });
      const message = slack.addMessage({
        channelId: CHANNEL_ID,
        text: 'oops',
      });

      const result = await slackDeleteMessageHandler({
        slackChannelId: CHANNEL_ID,
        messageTimestamp: message.timestamp,
      });

      expect(result.success).toBe(true);
      expect(slack.messagesIn(CHANNEL_ID)).toEqual([]);
    });

    it('should report a failure when the message to delete is gone', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });

      const result = await slackDeleteMessageHandler({
        slackChannelId: CHANNEL_ID,
        messageTimestamp: '1700000000.999999',
      });

      expect(result).toEqual({
        success: false,
        message: 'Failed to delete Slack message',
        error: 'An API error occurred: message_not_found',
      });
    });
  });

  describe('reactions and ephemeral messages', () => {
    it('should add a reaction to a message', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });
      const message = slack.addMessage({
        channelId: CHANNEL_ID,
        text: 'shipped',
      });

      const result = await slackAddReactionHandler({
        slackChannelId: CHANNEL_ID,
        messageTimestamp: message.timestamp,
        emojiName: ' tada ',
      });

      expect(result).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Reaction "tada" added to the message.',
        }),
      );
      expect(slack.reactions).toEqual([
        {
          channelId: CHANNEL_ID,
          messageTimestamp: message.timestamp,
          emojiName: 'tada',
        },
      ]);
    });

    it('should report the Slack error when the reaction is already there', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });
      const message = slack.addMessage({
        channelId: CHANNEL_ID,
        text: 'shipped',
      });
      const reactionInput = {
        slackChannelId: CHANNEL_ID,
        messageTimestamp: message.timestamp,
        emojiName: 'tada',
      };

      await slackAddReactionHandler(reactionInput);
      const result = await slackAddReactionHandler(reactionInput);

      expect(result).toEqual({
        success: false,
        message: 'Failed to add Slack reaction',
        error: 'An API error occurred: already_reacted',
      });
    });

    it('should send an ephemeral message to one user in a thread', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });

      const result = await slackPostEphemeralMessageHandler({
        slackChannelId: CHANNEL_ID,
        recipientSlackUserId: 'U0REQUESTER',
        messageText: 'only you can see this',
        parentMessageTimestamp: '  1700000000.000100  ',
      });

      expect(result.success).toBe(true);
      expect(slack.ephemeralMessages).toEqual([
        {
          channelId: CHANNEL_ID,
          recipientUserId: 'U0REQUESTER',
          threadTimestamp: '1700000000.000100',
          text: 'only you can see this',
          markdownText: undefined,
        },
      ]);
    });
  });

  describe('list channels', () => {
    const addChannels = (count: number): void => {
      for (let index = 0; index < count; index++) {
        slack.addChannel({
          id: `C0LIST${index}`,
          name: `channel-${index}`,
          numMembers: index,
        });
      }
    };

    it('should page through Slack until the requested limit is filled', async () => {
      addChannels(250);

      const result = await slackListChannelsHandler({ limit: 210 });

      expect(result.success).toBe(true);
      expect(result.count).toBe(210);
      expect(slack.callsTo('conversations.list')).toHaveLength(2);
      expect(slack.callsTo('conversations.list')[1].args.cursor).toBe('200');
      expect(result.channels[0]).toEqual({
        id: 'C0LIST0',
        name: 'channel-0',
        isPrivate: false,
        isArchived: false,
        isMember: true,
        numMembers: 0,
        topic: '',
        purpose: '',
      });
    });

    it('should stop when Slack runs out of channels', async () => {
      addChannels(3);

      const result = await slackListChannelsHandler({});

      expect(result.count).toBe(3);
      expect(slack.callsTo('conversations.list')).toHaveLength(1);
    });

    it('should ask Slack for private channels only and keep archived ones out by default', async () => {
      slack.addChannel({ id: 'C0PUBLIC', name: 'public' });
      slack.addChannel({ id: 'C0PRIVATE', name: 'private', isPrivate: true });
      slack.addChannel({
        id: 'C0ARCHIVED',
        name: 'archived',
        isPrivate: true,
        isArchived: true,
      });

      const result = await slackListChannelsHandler({ channelType: 'Private' });

      expect(slack.lastCallTo('conversations.list')?.args).toEqual(
        expect.objectContaining({
          types: 'private_channel',
          exclude_archived: true,
        }),
      );
      expect(result.channels.map((channel) => channel.id)).toEqual([
        'C0PRIVATE',
      ]);
    });
  });

  describe('http routes used by the app front components', () => {
    it('should post the message described by the request body', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });

      const result = await slackPostMessageRoute.config.handler(
        buildHttpRoutePayload({
          body: {
            slackChannelId: CHANNEL_ID,
            messageText: 'from the side panel',
            messageFormat: 'markdown',
          },
        }),
      );

      expect(result).toEqual(expect.objectContaining({ success: true }));
      expect(slack.messagesIn(CHANNEL_ID)).toEqual([
        expect.objectContaining({ markdownText: 'from the side panel' }),
      ]);
    });

    it('should ignore a message format the request body invented', async () => {
      slack.addChannel({ id: CHANNEL_ID, name: 'tools' });

      await slackPostMessageRoute.config.handler(
        buildHttpRoutePayload({
          body: {
            slackChannelId: CHANNEL_ID,
            messageText: 'from the side panel',
            messageFormat: 'html',
          },
        }),
      );

      expect(slack.messagesIn(CHANNEL_ID)).toEqual([
        expect.objectContaining({
          text: 'from the side panel',
          markdownText: undefined,
        }),
      ]);
    });

    it('should turn the channel list query string into Slack arguments', async () => {
      slack.addChannel({ id: 'C0PUBLIC', name: 'public' });
      slack.addChannel({
        id: 'C0ARCHIVED',
        name: 'archived',
        isArchived: true,
      });

      const result = await slackListChannelsRoute.config.handler(
        buildHttpRoutePayload({
          queryStringParameters: {
            channelType: 'Public',
            excludeArchived: 'false',
            limit: '5',
          },
          requestContext: {
            http: { method: 'GET', path: '/slack/channels' },
          },
        }),
      );

      expect(slack.lastCallTo('conversations.list')?.args).toEqual(
        expect.objectContaining({
          types: 'public_channel',
          exclude_archived: false,
          limit: '5',
        }),
      );
      expect(result).toEqual(expect.objectContaining({ count: 2 }));
    });

    it('should fall back to the defaults when the query string is unusable', async () => {
      slack.addChannel({ id: 'C0PUBLIC', name: 'public' });

      await slackListChannelsRoute.config.handler(
        buildHttpRoutePayload({
          queryStringParameters: { channelType: 'Secret', limit: 'many' },
          requestContext: {
            http: { method: 'GET', path: '/slack/channels' },
          },
        }),
      );

      expect(slack.lastCallTo('conversations.list')?.args).toEqual(
        expect.objectContaining({
          types: 'public_channel,private_channel',
          exclude_archived: true,
          limit: '200',
        }),
      );
    });
  });

  describe('without a Slack connection', () => {
    it('should return a failure result instead of calling Slack', async () => {
      appRuntime.setConnections([]);

      const results = await Promise.all([
        slackPostMessageHandler({
          slackChannelId: CHANNEL_ID,
          messageText: 'hello',
        }),
        slackUpdateMessageHandler({
          slackChannelId: CHANNEL_ID,
          messageTimestamp: '1700000000.000100',
          newMessageText: 'hello',
        }),
        slackDeleteMessageHandler({
          slackChannelId: CHANNEL_ID,
          messageTimestamp: '1700000000.000100',
        }),
        slackAddReactionHandler({
          slackChannelId: CHANNEL_ID,
          messageTimestamp: '1700000000.000100',
          emojiName: 'tada',
        }),
        slackPostEphemeralMessageHandler({
          slackChannelId: CHANNEL_ID,
          recipientSlackUserId: 'U0REQUESTER',
          messageText: 'hello',
        }),
      ]);

      for (const result of results) {
        expect(result.success).toBe(false);
        expect(result.error).toContain('Slack is not connected');
      }

      const listChannelsResult = await slackListChannelsHandler({});

      expect(listChannelsResult).toEqual(
        expect.objectContaining({ success: false, channels: [], count: 0 }),
      );
      expect(slack.calls).toHaveLength(0);
    });

    it('should surface an expired Slack token as a failure result', async () => {
      appRuntime.setConnections([
        {
          id: 'connected-account-slack-1',
          providerName: 'slack',
          name: 'Twenty Test workspace',
          handle: 'twenty-test',
          visibility: 'workspace',
          userWorkspaceId: 'user-workspace-1',
          accessToken: 'xoxb-revoked-token',
          scopes: [],
          authFailedAt: null,
        },
      ]);

      const result = await slackPostMessageHandler({
        slackChannelId: CHANNEL_ID,
        messageText: 'hello',
      });

      expect(result).toEqual({
        success: false,
        message: 'Failed to post Slack message',
        error: 'An API error occurred: invalid_auth',
      });
    });
  });
});
