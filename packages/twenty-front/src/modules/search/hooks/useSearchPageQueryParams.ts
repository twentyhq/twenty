import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { SEARCH_PAGE_OBJECT_QUERY_PARAM } from '@/search/constants/SearchPageObjectQueryParam';
import { SEARCH_PAGE_QUERY_PARAM } from '@/search/constants/SearchPageQueryParam';

// The URL is the only source of truth for what the page searches, so the page
// stays shareable and the browser history keeps working without any state to
// mirror back and forth. Typing replaces the current entry so a search does not
// leave one history step per keystroke behind it.
export const useSearchPageQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setQueryParam = useCallback(
    (key: string, value: string | null) => {
      setSearchParams(
        (previousSearchParams) => {
          const nextSearchParams = new URLSearchParams(previousSearchParams);

          if (isNonEmptyString(value)) {
            nextSearchParams.set(key, value);
          } else {
            nextSearchParams.delete(key);
          }

          return nextSearchParams;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setSearchInput = useCallback(
    (searchInput: string) =>
      setQueryParam(SEARCH_PAGE_QUERY_PARAM, searchInput),
    [setQueryParam],
  );

  const setObjectNameSingular = useCallback(
    (objectNameSingular: string | null) =>
      setQueryParam(SEARCH_PAGE_OBJECT_QUERY_PARAM, objectNameSingular),
    [setQueryParam],
  );

  return {
    searchInput: searchParams.get(SEARCH_PAGE_QUERY_PARAM) ?? '',
    objectNameSingular: searchParams.get(SEARCH_PAGE_OBJECT_QUERY_PARAM),
    setSearchInput,
    setObjectNameSingular,
  };
};
