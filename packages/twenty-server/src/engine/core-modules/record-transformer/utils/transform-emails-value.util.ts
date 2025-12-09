import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';

export const transformEmailsValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  if (!value) {
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
