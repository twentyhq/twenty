import { normalizeEmailForStorage } from 'src/utils/normalize-email-for-storage.util';

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
      typeof email === 'string' ? normalizeEmailForStorage(email) : email,
    );
  }

  if (
    (operator === 'eq' || operator === 'neq' || operator === 'eqStrict') &&
    typeof value === 'string'
  ) {
    return normalizeEmailForStorage(value);
  }

  return value;
};
