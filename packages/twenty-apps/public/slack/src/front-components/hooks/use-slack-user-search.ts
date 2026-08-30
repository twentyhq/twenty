import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINKS_SEARCH_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { toSlackResolvedUser } from 'src/front-components/utils/to-slack-resolved-user.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const SLACK_USER_SEARCH_DEBOUNCE_MS = 400;

type SlackUserSearchResponse = {
  options: SlackResolvedUser[];
  errorMessage: string | undefined;
};

const FALLBACK_SEARCH_ERROR_MESSAGE = 'Slack user search failed. Try again.';

// The search roster is the installed workspace by definition, so every option
// is in-workspace; guests and Slack Connect users go through the id path.
const parseSearchResponse = (value: unknown): SlackUserSearchResponse => {
  const record = asRecord(value);

  // A failed search must not read as an empty roster: the picker would tell
  // the admin the person does not exist and steer them to the id path.
  if (record === undefined || record.success !== true) {
    const error = record?.error;

    return {
      options: [],
      errorMessage: isNonEmptyString(error)
        ? error
        : FALLBACK_SEARCH_ERROR_MESSAGE,
    };
  }

  const slackUsers = Array.isArray(record.slackUsers) ? record.slackUsers : [];

  const options: SlackResolvedUser[] = [];

  for (const entry of slackUsers) {
    const slackUserRecord = asRecord(entry);

    const option =
      slackUserRecord === undefined
        ? undefined
        : toSlackResolvedUser({
            record: slackUserRecord,
            isInInstalledWorkspace: true,
          });

    if (!isDefined(option) || !isNonEmptyString(option.slackTeamId)) {
      continue;
    }

    options.push(option);
  }

  return { options, errorMessage: undefined };
};

type SlackUserSearchState = {
  options: SlackResolvedUser[];
  isSearching: boolean;
  searchErrorMessage: string | undefined;
};

export const useSlackUserSearch = (
  searchTerm: string,
): SlackUserSearchState => {
  const [options, setOptions] = useState<SlackResolvedUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const trimmedSearchTerm = searchTerm.trim();

    if (!isNonEmptyString(trimmedSearchTerm)) {
      setOptions([]);
      setSearchErrorMessage(undefined);
      setIsSearching(false);

      return;
    }

    let cancelled = false;

    // Enter selects the top option, so stale results must never survive a
    // changed term: an admin could otherwise pick the previous search's match.
    setOptions([]);
    setSearchErrorMessage(undefined);
    setIsSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const result = await new RestApiClient().post(
          `/s${SLACK_USER_LINKS_SEARCH_ROUTE_PATH}`,
          { query: trimmedSearchTerm },
        );

        if (!cancelled) {
          const { options: parsedOptions, errorMessage } =
            parseSearchResponse(result);

          setOptions(parsedOptions);
          setSearchErrorMessage(errorMessage);
        }
      } catch {
        // A transport error's message carries the raw request URL; the admin
        // gets the generic wording instead.
        if (!cancelled) {
          setOptions([]);
          setSearchErrorMessage(FALLBACK_SEARCH_ERROR_MESSAGE);
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

  return { options, isSearching, searchErrorMessage };
};
