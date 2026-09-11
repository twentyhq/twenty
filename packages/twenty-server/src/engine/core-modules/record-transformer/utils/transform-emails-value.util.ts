import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'class-validator';
import { canonicalizeEmail } from 'twenty-shared/utils';

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
    ? canonicalizeEmail(value.primaryEmail)
    : null;

  if (additionalEmails) {
    try {
      const emailArray = (
        isNonEmptyString(additionalEmails)
          ? JSON.parse(additionalEmails)
          : additionalEmails
      ) as string[];

      additionalEmails = isNonEmptyArray(emailArray)
        ? JSON.stringify(emailArray.map(canonicalizeEmail))
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
