import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackChannelSearchOption } from 'src/logic-functions/types/slack-channel-search.type';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

export type SlackChannelSearchResponse = {
  options: SlackChannelSearchOption[];
  errorMessage: string | undefined;
};

export const FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE =
  'Slack channel search failed. Try again.';

export const parseSlackChannelSearchResponse = (
  value: unknown,
): SlackChannelSearchResponse => {
  const record = asRecord(value);

  if (!isDefined(record) || record.success !== true) {
    const error = record?.error;

    return {
      options: [],
      errorMessage: isNonEmptyString(error)
        ? error
        : FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE,
    };
  }

  const slackChannels = Array.isArray(record.slackChannels)
    ? record.slackChannels
    : [];

  const options: SlackChannelSearchOption[] = [];

  for (const entry of slackChannels) {
    const channelRecord = asRecord(entry);

    if (
      !isDefined(channelRecord) ||
      !isNonEmptyString(channelRecord.slackChannelId) ||
      !isNonEmptyString(channelRecord.name)
    ) {
      continue;
    }

    options.push({
      slackChannelId: channelRecord.slackChannelId,
      name: channelRecord.name,
      isPrivate: channelRecord.isPrivate === true,
      isMember: channelRecord.isMember === true,
    });
  }

  return { options, errorMessage: undefined };
};
