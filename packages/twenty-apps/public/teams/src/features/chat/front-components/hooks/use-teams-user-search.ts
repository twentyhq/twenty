import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_USER_LINKS_SEARCH_ROUTE_PATH } from 'src/features/chat/constants/teams-user-links-route-path';
import {
  type TeamsUserSearchOption,
  type TeamsUserSearchResult,
} from 'src/features/chat/logic-functions/types/teams-user-search-option.type';

const TEAMS_USER_SEARCH_DEBOUNCE_MS = 400;

const SEARCH_ERROR_MESSAGE = 'Teams user search failed. Try again.';

type TeamsUserSearchState = {
  options: TeamsUserSearchOption[];
  isSearching: boolean;
  searchErrorMessage: string | undefined;
};

export const useTeamsUserSearch = (
  searchTerm: string,
): TeamsUserSearchState => {
  const [options, setOptions] = useState<TeamsUserSearchOption[]>([]);
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
        const result = await new RestApiClient().post<
          TeamsUserSearchResult | undefined
        >(`/s${TEAMS_USER_LINKS_SEARCH_ROUTE_PATH}`, {
          query: trimmedSearchTerm,
        });

        if (cancelled) {
          return;
        }

        if (!isDefined(result) || !result.success) {
          setOptions([]);
          setSearchErrorMessage(result?.error ?? SEARCH_ERROR_MESSAGE);

          return;
        }

        setOptions(result.teamsUsers);
        setSearchErrorMessage(undefined);
      } catch {
        if (!cancelled) {
          setOptions([]);
          setSearchErrorMessage(SEARCH_ERROR_MESSAGE);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, TEAMS_USER_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  return { options, isSearching, searchErrorMessage };
};
