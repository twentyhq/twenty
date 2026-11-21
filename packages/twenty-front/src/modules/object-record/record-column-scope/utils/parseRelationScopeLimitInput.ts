import { isNonEmptyString } from '@sniptt/guards';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';

type ParsedRelationScopeLimitInput =
  | { isValid: true; limit: number | null }
  | { isValid: false };

export const parseRelationScopeLimitInput = (
  limitInput: string,
): ParsedRelationScopeLimitInput => {
  const trimmedLimitInput = limitInput.trim();

  if (!isNonEmptyString(trimmedLimitInput)) {
    return { isValid: true, limit: null };
  }

  const limit = Number(trimmedLimitInput);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > QUERY_MAX_RECORDS_FROM_RELATION
  ) {
    return { isValid: false };
  }

  return { isValid: true, limit };
};
