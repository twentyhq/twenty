import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

const SLACK_SEARCH_DEBOUNCE_MS = 400;

type SlackRouteSearchState<TOption> = {
  options: TOption[];
  isSearching: boolean;
  searchErrorMessage: string | undefined;
};

export const useSlackRouteSearch = <TOption>({
  routePath,
  searchTerm,
  parseResponse,
  fallbackErrorMessage,
}: {
  routePath: string;
  searchTerm: string;
  parseResponse: (value: unknown) => {
    options: TOption[];
    errorMessage: string | undefined;
  };
  fallbackErrorMessage: string;
}): SlackRouteSearchState<TOption> => {
  const [options, setOptions] = useState<TOption[]>([]);
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
        const result = await new RestApiClient().post(`/s${routePath}`, {
          query: trimmedSearchTerm,
        });

        if (!cancelled) {
          const { options: parsedOptions, errorMessage } =
            parseResponse(result);

          setOptions(parsedOptions);
          setSearchErrorMessage(errorMessage);
        }
      } catch {
        if (!cancelled) {
          setOptions([]);
          setSearchErrorMessage(fallbackErrorMessage);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, SLACK_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [routePath, searchTerm, parseResponse, fallbackErrorMessage]);

  return { options, isSearching, searchErrorMessage };
};
