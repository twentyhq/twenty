import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';

import { SLACK_RATE_LIMIT_RETRY_BUDGET_MS } from 'src/logic-functions/constants/slack-rate-limit-retry-budget-ms';
import { type SlackChannelSearchOption } from 'src/logic-functions/types/slack-channel-search.type';
import { retrySlackCallWhenRateLimited } from 'src/logic-functions/utils/retry-slack-call-when-rate-limited';

const CHANNELS_PER_PAGE = 1000;
const DEFAULT_MAX_PAGES = 20;
const CHANNEL_TYPES = 'public_channel,private_channel';

export const searchSlackChannelsByName = async ({
  slackClient,
  query,
  maxResults,
  maxPages = DEFAULT_MAX_PAGES,
  rateLimitRetryBudgetMs = SLACK_RATE_LIMIT_RETRY_BUDGET_MS,
}: {
  slackClient: WebClient;
  query: string;
  maxResults: number;
  maxPages?: number;
  rateLimitRetryBudgetMs?: number;
}): Promise<SlackChannelSearchOption[]> => {
  const normalizedQuery = query.toLowerCase();
  const slackChannels: SlackChannelSearchOption[] = [];
  const rateLimitDeadlineAtMs = Date.now() + rateLimitRetryBudgetMs;
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page += 1) {
    const response = await retrySlackCallWhenRateLimited({
      call: async () =>
        slackClient.conversations.list({
          types: CHANNEL_TYPES,
          exclude_archived: true,
          limit: CHANNELS_PER_PAGE,
          cursor,
        }),
      budgetMs: Math.max(rateLimitDeadlineAtMs - Date.now(), 0),
    });

    for (const channel of response.channels ?? []) {
      if (slackChannels.length >= maxResults) {
        break;
      }

      if (
        !isNonEmptyString(channel.id) ||
        !isNonEmptyString(channel.name) ||
        !channel.name.toLowerCase().includes(normalizedQuery)
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

    if (slackChannels.length >= maxResults || !isNonEmptyString(cursor)) {
      break;
    }
  }

  return slackChannels;
};
