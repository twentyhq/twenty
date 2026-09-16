import { isNonEmptyString } from '@sniptt/guards';

import { type SlackChannelSearchResult } from 'src/logic-functions/types/slack-channel-search.type';
import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { searchSlackChannelsByName } from 'src/logic-functions/utils/search-slack-channels-by-name';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const MAX_RESULTS = 10;

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
  const query = readOptionalString(body.query)?.trim().replace(/^#/, '');

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

  try {
    const slackChannels = await searchSlackChannelsByName({
      slackClient: slackClientResult.client,
      query,
      maxResults: MAX_RESULTS,
    });

    return { success: true, slackChannels };
  } catch (error) {
    return {
      success: false,
      message: 'Could not search Slack channels',
      error: toErrorMessage(error),
    };
  }
};
