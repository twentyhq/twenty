import { isNonEmptyString } from '@sniptt/guards';

import {
  type SlackChannelSearchOption,
  type SlackChannelSearchResult,
} from 'src/logic-functions/types/slack-channel-search.type';
import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const MAX_RESULTS = 10;
const MAX_PAGES = 3;
const SLACK_PAGE_SIZE = 200;
const CHANNEL_TYPES = 'public_channel,private_channel';

export const slackSearchChannelsHandler = async (
  payload: SlackRouteBody,
): Promise<SlackChannelSearchResult> => {
  const isAllowed = await currentUserHasRolesPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the roles permission can search Slack channels.',
    };
  }

  const body = asRecord(payload.body) ?? {};
  const query = readOptionalString(body.query)
    ?.trim()
    .replace(/^#/, '')
    .toLowerCase();

  if (!isNonEmptyString(query)) {
    return { success: true, slackChannels: [] };
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  const slackClient = slackClientResult.client;
  const slackChannels: SlackChannelSearchOption[] = [];
  let cursor: string | undefined;

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const response = await slackClient.conversations.list({
        types: CHANNEL_TYPES,
        exclude_archived: true,
        limit: SLACK_PAGE_SIZE,
        cursor,
      });

      for (const channel of response.channels ?? []) {
        if (slackChannels.length >= MAX_RESULTS) {
          break;
        }

        if (
          !isNonEmptyString(channel.id) ||
          !isNonEmptyString(channel.name) ||
          !channel.name.toLowerCase().includes(query)
        ) {
          continue;
        }

        slackChannels.push({
          slackChannelId: channel.id,
          name: channel.name,
          isPrivate: channel.is_private === true,
          isMember: channel.is_member === true,
        });
      }

      cursor = response.response_metadata?.next_cursor;

      if (slackChannels.length >= MAX_RESULTS || !isNonEmptyString(cursor)) {
        break;
      }
    }

    return { success: true, slackChannels };
  } catch (error) {
    return {
      success: false,
      message: 'Could not search Slack channels',
      error: toErrorMessage(error),
    };
  }
};
