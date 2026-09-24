import { isNonEmptyString } from '@sniptt/guards';

const MINIMUM_QUERY_LENGTH = 3;
const MAXIMUM_QUERY_LENGTH = 200;
const RESULTS_LIMIT = 5;
const QUERY_FIRST_CHARACTER_REGEX = /^[\p{L}\p{N}]/u;

export const buildAddressAutocompleteBanSearchParams = ({
  query,
  isCityOnly,
  citycode,
  type,
}: {
  query: string;
  isCityOnly?: boolean;
  citycode?: string;
  type?: string;
}): URLSearchParams | null => {
  const trimmedQuery = query.trim().slice(0, MAXIMUM_QUERY_LENGTH);

  if (
    trimmedQuery.length < MINIMUM_QUERY_LENGTH ||
    !QUERY_FIRST_CHARACTER_REGEX.test(trimmedQuery)
  ) {
    return null;
  }

  const searchParams = new URLSearchParams({
    q: trimmedQuery,
    limit: String(RESULTS_LIMIT),
  });

  if (isCityOnly === true) {
    searchParams.set('type', 'municipality');
  }

  if (isNonEmptyString(type)) {
    searchParams.set('type', type);
  }

  if (isNonEmptyString(citycode)) {
    searchParams.set('citycode', citycode);
  }

  return searchParams;
};
