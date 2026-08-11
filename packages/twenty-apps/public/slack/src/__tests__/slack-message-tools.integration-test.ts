import { describe, expect, it } from 'vitest';

import {
  SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER,
  SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER,
  SLACK_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER,
  SLACK_LIST_CHANNELS_UNIVERSAL_IDENTIFIER,
  SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER,
  SLACK_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER,
  SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER,
  SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { type SlackListChannelsResult } from 'src/logic-functions/types/slack-list-channels-result.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { runSlackLogicFunction } from 'src/__tests__/utils/execute-slack-logic-function';
import { SLACK_TEST_CHANNEL_ID } from 'src/__tests__/utils/build-slack-event-body';

const MESSAGE_TIMESTAMP = '1700000000.000100';

const NOT_CONNECTED_ERROR = 'Slack is not connected.';

// The test workspace has no Slack connection: every tool must surface the
// missing connection instead of throwing, so agents and workflows keep running.
describe('Slack message tools without a Slack connection', () => {
  it.each([
    {
      name: 'slack-post-message',
      universalIdentifier: SLACK_POST_MESSAGE_UNIVERSAL_IDENTIFIER,
      payload: {
        slackChannelId: SLACK_TEST_CHANNEL_ID,
        messageText: 'hello from the integration suite',
        messageFormat: 'markdown',
      },
    },
    {
      name: 'slack-post-ephemeral-message',
      universalIdentifier: SLACK_POST_EPHEMERAL_MESSAGE_UNIVERSAL_IDENTIFIER,
      payload: {
        slackChannelId: SLACK_TEST_CHANNEL_ID,
        recipientSlackUserId: 'U0HUMANTEST',
        messageText: 'only for you',
      },
    },
    {
      name: 'slack-update-message',
      universalIdentifier: SLACK_UPDATE_MESSAGE_UNIVERSAL_IDENTIFIER,
      payload: {
        slackChannelId: SLACK_TEST_CHANNEL_ID,
        messageTimestamp: MESSAGE_TIMESTAMP,
        newMessageText: 'edited',
      },
    },
    {
      name: 'slack-delete-message',
      universalIdentifier: SLACK_DELETE_MESSAGE_UNIVERSAL_IDENTIFIER,
      payload: {
        slackChannelId: SLACK_TEST_CHANNEL_ID,
        messageTimestamp: MESSAGE_TIMESTAMP,
      },
    },
    {
      name: 'slack-add-reaction',
      universalIdentifier: SLACK_ADD_REACTION_UNIVERSAL_IDENTIFIER,
      payload: {
        slackChannelId: SLACK_TEST_CHANNEL_ID,
        messageTimestamp: MESSAGE_TIMESTAMP,
        emojiName: 'tada',
      },
    },
  ])(
    'should report the missing connection from $name',
    async ({ universalIdentifier, payload }) => {
      const result = await runSlackLogicFunction<SlackToolResult>({
        universalIdentifier,
        payload,
      });

      expect(result).toMatchObject({
        success: false,
        message: 'Slack is not connected',
        error: expect.stringContaining(NOT_CONNECTED_ERROR),
      });
    },
  );

  it('should report the missing connection from slack-list-channels', async () => {
    const result = await runSlackLogicFunction<SlackListChannelsResult>({
      universalIdentifier: SLACK_LIST_CHANNELS_UNIVERSAL_IDENTIFIER,
      payload: { channelType: 'Public', limit: 10 },
    });

    expect(result).toMatchObject({
      success: false,
      channels: [],
      count: 0,
      error: expect.stringContaining(NOT_CONNECTED_ERROR),
    });
  });
});

describe('Slack HTTP routes used by the send message command', () => {
  it('should read the message from the request body', async () => {
    const result = await runSlackLogicFunction<SlackToolResult>({
      universalIdentifier: SLACK_POST_MESSAGE_ROUTE_UNIVERSAL_IDENTIFIER,
      payload: {
        body: {
          slackChannelId: SLACK_TEST_CHANNEL_ID,
          messageText: 'sent from the command menu',
          messageFormat: 'not-a-format',
        },
      },
    });

    expect(result).toMatchObject({
      success: false,
      message: 'Slack is not connected',
    });
  });

  it('should read the channel filters from the query string', async () => {
    const result = await runSlackLogicFunction<SlackListChannelsResult>({
      universalIdentifier: SLACK_LIST_CHANNELS_ROUTE_UNIVERSAL_IDENTIFIER,
      payload: {
        queryStringParameters: {
          channelType: 'Private',
          limit: '5',
          excludeArchived: 'false',
        },
      },
    });

    expect(result).toMatchObject({ success: false, channels: [], count: 0 });
  });
});
