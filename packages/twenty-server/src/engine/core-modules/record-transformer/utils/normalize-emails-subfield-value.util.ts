import { isNonEmptyString } from '@sniptt/guards';

import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';

export const normalizeEmailsSubfieldValue = ({
  subFieldName,
  value,
}: {
  subFieldName: string | undefined;
  value: unknown;
}): unknown => {
  if (subFieldName === 'primaryEmail' && isNonEmptyString(value)) {
    return normalizeEmailAddress(value);
  }

  if (subFieldName === 'additionalEmails') {
    let emails = value;

    if (isNonEmptyString(emails)) {
      try {
        emails = JSON.parse(emails);
      } catch {
        return value;
      }
    }

    if (Array.isArray(emails)) {
      return emails.map((email) =>
        isNonEmptyString(email) ? normalizeEmailAddress(email) : email,
      );
    }
  }

  return value;
};
