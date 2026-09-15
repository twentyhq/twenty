import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_SEARCH_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import {
  FALLBACK_SEARCH_ERROR_MESSAGE,
  parseSlackUserSearchResponse,
} from 'src/front-components/utils/parse-slack-user-search-response.util';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';

const SLACK_USER_SEARCH_DEBOUNCE_MS = 400;

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
            parseSlackUserSearchResponse(result);

          setOptions(parsedOptions);
          setSearchErrorMessage(errorMessage);
        }
      } catch {
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
