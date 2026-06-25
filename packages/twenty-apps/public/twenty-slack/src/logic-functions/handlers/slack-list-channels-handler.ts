import {
  type SlackChannelType,
  type SlackListChannelsInput
} from 'src/logic-functions/types/slack-list-channels-input.type';
import {
  type SlackListChannelsResult,
  type SlackListChannelsResultChannel
} from 'src/logic-functions/types/slack-list-channels-result.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';

const DEFAULT_LIMIT = 200;
const MAX_LIMIT = 1000;
const SLACK_PAGE_SIZE = 200;

const SLACK_TYPES_BY_CHANNEL_TYPE = {
  Public: 'public_channel',
  Private: 'private_channel',
  All: 'public_channel,private_channel',
} as const satisfies Record<SlackChannelType, string>;

export const slackListChannelsHandler = async (
  parameters: SlackListChannelsInput,
): Promise<SlackListChannelsResult> => {
  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      channels: [],
      count: 0,
      error: slackClientResult.error,
    };
  }

  const { client } = slackClientResult;

  const limit = Math.min(
    Math.max(parameters.limit ?? DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );
  const excludeArchived = parameters.excludeArchived ?? true;
  const types = SLACK_TYPES_BY_CHANNEL_TYPE[parameters.channelType ?? 'All'];

  const channels: SlackListChannelsResultChannel[] = [];
  let cursor: string | undefined;

  try {
    while (channels.length < limit) {
      const remaining = limit - channels.length;
      const response = await client.conversations.list({
        types,
        exclude_archived: excludeArchived,
        limit: Math.min(SLACK_PAGE_SIZE, remaining),
        cursor,
      });

      const page = response.channels ?? [];

      for (const channel of page) {
        if (channels.length >= limit) {
          break;
        }

        if (channel.id == null || channel.name == null) {
          continue;
        }

        channels.push({
          id: channel.id,
          name: channel.name,
          isPrivate: channel.is_private === true,
          isArchived: channel.is_archived === true,
          isMember: channel.is_member === true,
          numMembers: channel.num_members ?? 0,
          topic: channel.topic?.value ?? '',
          purpose: channel.purpose?.value ?? '',
        });
      }

      const nextCursor = response.response_metadata?.next_cursor;

      if (nextCursor == null || nextCursor.length === 0) {
        break;
      }

      cursor = nextCursor;
    }

    return {
      success: true,
      channels,
      count: channels.length,
    };
  } catch (error) {
    return {
      success: false,
      channels: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Slack request failed',
    };
  }
};
