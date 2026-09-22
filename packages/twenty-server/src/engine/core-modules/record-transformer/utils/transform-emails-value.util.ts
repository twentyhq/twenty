import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';
import { normalizeEmailsSubfieldValue } from 'src/engine/core-modules/record-transformer/utils/normalize-emails-subfield-value.util';

export const transformEmailsValue = (
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any,
  // oxlint-disable-next-line typescript/no-explicit-any
): any => {
  if (!isDefined(value)) {
    return value;
  }

  let additionalEmails: string | null = value?.additionalEmails;
  const primaryEmail = isNonEmptyString(value?.primaryEmail)
    ? normalizeEmailAddress(value.primaryEmail)
    : null;

  if (additionalEmails) {
    try {
      const emailArray = (
        isNonEmptyString(additionalEmails)
          ? JSON.parse(additionalEmails)
          : additionalEmails
      ) as string[];

      const normalizedEmails = normalizeEmailsSubfieldValue(
        'additionalEmails',
        emailArray,
      );

      additionalEmails = isNonEmptyArray(normalizedEmails)
        ? JSON.stringify(normalizedEmails)
        : null;
    } catch {
      /* empty */
    }
  }

  return {
    primaryEmail,
    additionalEmails,
  };
};
