import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_SEARCH_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { asRecord } from 'src/front-components/utils/as-record.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const SLACK_USER_SEARCH_DEBOUNCE_MS = 400;

// The search roster is the installed workspace by definition, so every option
// is in-workspace; guests and Slack Connect users go through the id path.
const parseOptions = (value: unknown): SlackResolvedUser[] => {
  const record = asRecord(value);

  if (record === undefined || record.success !== true) {
    return [];
  }

  const slackUsers = Array.isArray(record.slackUsers) ? record.slackUsers : [];
  const options: SlackResolvedUser[] = [];

  for (const entry of slackUsers) {
    const slackUser = asRecord(entry);

    if (
      slackUser === undefined ||
      !isNonEmptyString(slackUser.slackUserId) ||
      !isNonEmptyString(slackUser.slackTeamId)
    ) {
      continue;
    }

    options.push({
      slackUserId: slackUser.slackUserId,
      slackTeamId: slackUser.slackTeamId,
      displayName: isNonEmptyString(slackUser.displayName)
        ? slackUser.displayName
        : undefined,
      email: isNonEmptyString(slackUser.email) ? slackUser.email : undefined,
      isInInstalledWorkspace: true,
    });
  }

  return options;
};

type SlackUserSearchState = {
  options: SlackResolvedUser[];
  isSearching: boolean;
};

export const useSlackUserSearch = (
  searchTerm: string,
): SlackUserSearchState => {
  const [options, setOptions] = useState<SlackResolvedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();

    if (!isNonEmptyString(trimmedSearchTerm)) {
      setOptions([]);
      setIsSearching(false);

      return;
    }

    let cancelled = false;

    // Enter selects the top option, so stale results must never survive a
    // changed term: an admin could otherwise pick the previous search's match.
    setOptions([]);
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const result = await new RestApiClient().post(
          `/s${SLACK_USER_LINKS_SEARCH_ROUTE_PATH}`,
          { query: trimmedSearchTerm },
        );

        if (!cancelled) {
          setOptions(parseOptions(result));
        }
      } catch {
        if (!cancelled) {
          setOptions([]);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, SLACK_USER_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  return { options, isSearching };
};
