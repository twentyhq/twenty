import { isNonEmptyString } from '@sniptt/guards';

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
      isNonEmptyString(email) ? normalizeEmailForStorage(email) : email,
    );
  }

  if (
    (operator === 'eq' || operator === 'neq' || operator === 'eqStrict') &&
    isNonEmptyString(value)
  ) {
    return normalizeEmailForStorage(value);
  }

  return value;
};
