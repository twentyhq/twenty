import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { type SlackChannelRuleRecord } from 'src/front-components/types/slack-channel-rule-record.type';

const SLACK_CHANNEL_RULES_PAGE_SIZE = 200;
const SLACK_CHANNEL_RULES_MAX_PAGES = 10;

const SLACK_CHANNEL_RULES_ERROR_MESSAGE =
  'Could not load Slack channel rules. Please try again later.';

type SlackChannelRuleRestRecord = {
  id?: string | null;
  name?: string | null;
  slackChannelId?: string | null;
  slackTeamId?: string | null;
  mode?: string | null;
};

type SlackChannelRulesResponse = {
  data?: { slackChannelRules?: SlackChannelRuleRestRecord[] | null } | null;
  totalCount?: number | null;
  pageInfo?: {
    hasNextPage?: boolean | null;
    endCursor?: string | null;
  } | null;
};

const fetchAllSlackChannelRulePages = async (): Promise<{
  records: SlackChannelRuleRestRecord[];
  totalCount: number | undefined;
}> => {
  const client = new RestApiClient();
  const records: SlackChannelRuleRestRecord[] = [];
  let startingAfter: string | undefined;
  let totalCount: number | undefined;

  for (let page = 0; page < SLACK_CHANNEL_RULES_MAX_PAGES; page += 1) {
    const response = await client.get<SlackChannelRulesResponse>(
      '/rest/slackChannelRules',
      {
        query: {
          limit: String(SLACK_CHANNEL_RULES_PAGE_SIZE),
          starting_after: startingAfter,
        },
      },
    );

    records.push(...(response.data?.slackChannelRules ?? []));
    totalCount = isNumber(response.totalCount)
      ? response.totalCount
      : totalCount;

    const endCursor = response.pageInfo?.endCursor;

    if (
      response.pageInfo?.hasNextPage !== true ||
      !isNonEmptyString(endCursor)
    ) {
      break;
    }

    startingAfter = endCursor;
  }

  return { records, totalCount };
};

type SlackChannelRulesState = {
  slackChannelRules: SlackChannelRuleRecord[];
  isSlackChannelRulesLoading: boolean;
  channelRulesErrorMessage: string | undefined;
  hasMoreSlackChannelRules: boolean;
  refetchSlackChannelRules: () => Promise<void>;
};

export const useSlackChannelRules = (): SlackChannelRulesState => {
  const [slackChannelRules, setSlackChannelRules] = useState<
    SlackChannelRuleRecord[]
  >([]);
  const [isSlackChannelRulesLoading, setIsSlackChannelRulesLoading] =
    useState(true);
  const [channelRulesErrorMessage, setChannelRulesErrorMessage] = useState<
    string | undefined
  >(undefined);
  const [hasMoreSlackChannelRules, setHasMoreSlackChannelRules] =
    useState(false);
  const fetchIdRef = useRef(0);

  const fetchSlackChannelRules = useCallback(async () => {
    fetchIdRef.current += 1;
    const fetchId = fetchIdRef.current;

    setIsSlackChannelRulesLoading(true);
    setChannelRulesErrorMessage(undefined);

    try {
      const { records: restRecords, totalCount } =
        await fetchAllSlackChannelRulePages();

      const records: SlackChannelRuleRecord[] = [];

      for (const record of restRecords) {
        if (!isNonEmptyString(record.id)) {
          continue;
        }

        records.push({
          id: record.id,
          name: record.name ?? null,
          slackChannelId: record.slackChannelId ?? null,
          slackTeamId: record.slackTeamId ?? null,
          mode: record.mode ?? null,
        });
      }

      records.sort((left, right) =>
        (left.name ?? left.slackChannelId ?? '').localeCompare(
          right.name ?? right.slackChannelId ?? '',
        ),
      );

      if (fetchId !== fetchIdRef.current) {
        return;
      }

      setHasMoreSlackChannelRules(
        isNumber(totalCount) && totalCount > records.length,
      );
      setSlackChannelRules(records);
    } catch {
      if (fetchId === fetchIdRef.current) {
        setChannelRulesErrorMessage(SLACK_CHANNEL_RULES_ERROR_MESSAGE);
      }
    } finally {
      if (fetchId === fetchIdRef.current) {
        setIsSlackChannelRulesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSlackChannelRules();
  }, [fetchSlackChannelRules]);

  return {
    slackChannelRules,
    isSlackChannelRulesLoading,
    channelRulesErrorMessage,
    hasMoreSlackChannelRules,
    refetchSlackChannelRules: fetchSlackChannelRules,
  };
};
