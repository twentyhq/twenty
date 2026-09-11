import {
  canonicalizeEmail,
  getEmailMatchCandidates,
} from 'twenty-shared/utils';

const CANONICAL_EMAIL_FILTER_OPERATORS = new Set(['eq', 'neq', 'in']);

export const canonicalizeEmailFilter = (
  filter: Record<string, unknown>,
): Record<string, unknown> => {
  const [[operator, value]] = Object.entries(filter);

  if (!CANONICAL_EMAIL_FILTER_OPERATORS.has(operator)) {
    return filter;
  }

  if (Array.isArray(value)) {
    return {
      [operator]: [
        ...new Set(
          value.flatMap((item) =>
            typeof item === 'string' ? getEmailMatchCandidates(item) : [item],
          ),
        ),
      ],
    };
  }

  if (operator === 'eq' && typeof value === 'string') {
    const candidates = getEmailMatchCandidates(value);

    return candidates.length === 1 ? { eq: candidates[0] } : { in: candidates };
  }

  return {
    [operator]: typeof value === 'string' ? canonicalizeEmail(value) : value,
  };
};
