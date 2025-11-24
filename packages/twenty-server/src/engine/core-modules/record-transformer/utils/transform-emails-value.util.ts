import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'class-validator';

export const transformEmailsValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  isNullEquivalenceEnabled: boolean = false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  if (!value) {
    return value;
  }

  let additionalEmails = value?.additionalEmails;
  const primaryEmail = value?.primaryEmail
    ? value.primaryEmail.toLowerCase()
    : isNullEquivalenceEnabled
      ? null
      : '';

  if (isDefined(additionalEmails)) {
    try {
      const emailArray = (
        isNonEmptyString(additionalEmails)
          ? JSON.parse(additionalEmails)
          : isNullEquivalenceEnabled
            ? null
            : additionalEmails
      ) as string[];

      additionalEmails = isNull(emailArray)
        ? null
        : JSON.stringify(emailArray.map((email) => email.toLowerCase()));
    } catch {
      /* empty */
    }
  }

  return {
    primaryEmail,
    additionalEmails,
  };
};
