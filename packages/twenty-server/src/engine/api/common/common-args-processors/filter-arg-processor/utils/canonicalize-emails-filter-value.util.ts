import { canonicalizeEmail } from 'twenty-shared/utils';

export const canonicalizeEmailsFilterValue = ({
  value,
  operator,
  subFieldKey,
}: {
  value: unknown;
  operator: string;
  subFieldKey: string;
}): unknown => {
  if (subFieldKey !== 'primaryEmail') {
    return value;
  }

  if (operator === 'in' && Array.isArray(value)) {
    return value.map((email) =>
      typeof email === 'string' ? canonicalizeEmail(email) : email,
    );
  }

  if (
    (operator === 'eq' || operator === 'neq' || operator === 'eqStrict') &&
    typeof value === 'string'
  ) {
    return canonicalizeEmail(value);
  }

  return value;
};
