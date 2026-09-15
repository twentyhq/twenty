import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_CHANNEL_RULES_SEARCH_ROUTE_PATH } from 'src/constants/slack-channel-rules-route-path.constant';
import {
  FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE,
  parseSlackChannelSearchResponse,
} from 'src/front-components/utils/parse-slack-channel-search-response.util';
import { type SlackChannelSearchOption } from 'src/logic-functions/types/slack-channel-search.type';

const SLACK_CHANNEL_SEARCH_DEBOUNCE_MS = 400;

type SlackChannelSearchState = {
  options: SlackChannelSearchOption[];
  isSearching: boolean;
  searchErrorMessage: string | undefined;
};

export const useSlackChannelSearch = (
  searchTerm: string,
): SlackChannelSearchState => {
  const [options, setOptions] = useState<SlackChannelSearchOption[]>([]);
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
          `/s${SLACK_CHANNEL_RULES_SEARCH_ROUTE_PATH}`,
          { query: trimmedSearchTerm },
        );

        if (!cancelled) {
          const { options: parsedOptions, errorMessage } =
            parseSlackChannelSearchResponse(result);

          setOptions(parsedOptions);
          setSearchErrorMessage(errorMessage);
        }
      } catch {
        if (!cancelled) {
          setOptions([]);
          setSearchErrorMessage(FALLBACK_CHANNEL_SEARCH_ERROR_MESSAGE);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, SLACK_CHANNEL_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  return { options, isSearching, searchErrorMessage };
};
