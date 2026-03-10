import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'class-validator';

export const transformEmailsValue = (
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
  value: any,
  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
): any => {
  if (!isDefined(value)) {
    return value;
  }

  let additionalEmails: string | null = value?.additionalEmails;
  const primaryEmail = isNonEmptyString(value?.primaryEmail)
    ? value.primaryEmail.toLowerCase()
    : null;

  if (additionalEmails) {
    try {
      const emailArray = (
        isNonEmptyString(additionalEmails)
          ? JSON.parse(additionalEmails)
          : additionalEmails
      ) as string[];

      additionalEmails = isNonEmptyArray(emailArray)
        ? JSON.stringify(emailArray.map((email) => email.toLowerCase()))
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
