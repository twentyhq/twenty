import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'class-validator';

import { normalizeEmailForStorage } from 'src/utils/normalize-email-for-storage.util';

export const transformEmailsValue = (
  // oxlint-disable-next-line typescript/no-explicit-any
  value: any,
  // oxlint-disable-next-line typescript/no-explicit-any
): any => {
  if (!isDefined(value)) {
    return value;
  }

  let additionalEmails: string | null = value?.additionalEmails;
  const normalizedPrimaryEmail = isNonEmptyString(value?.primaryEmail)
    ? normalizeEmailForStorage(value.primaryEmail)
    : null;
  const primaryEmail = isNonEmptyString(normalizedPrimaryEmail)
    ? normalizedPrimaryEmail
    : null;

  if (additionalEmails) {
    try {
      const emailArray = (
        isNonEmptyString(additionalEmails)
          ? JSON.parse(additionalEmails)
          : additionalEmails
      ) as string[];

      additionalEmails = isNonEmptyArray(emailArray)
        ? JSON.stringify(emailArray.map(normalizeEmailForStorage))
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
