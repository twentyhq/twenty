import { isNonEmptyString } from '@sniptt/guards';

export const transformEmailsValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  isNullEquivalenceEnabled: boolean = false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  if (!value) {
    return value;
  }

  let additionalEmails: string | null = value?.additionalEmails;
  const primaryEmail = value?.primaryEmail
    ? value.primaryEmail.toLowerCase()
    : isNullEquivalenceEnabled
      ? null
      : '';

  if (additionalEmails) {
    try {
      const emailArray = (
        isNonEmptyString(additionalEmails)
          ? JSON.parse(additionalEmails)
          : additionalEmails
      ) as string[];

      additionalEmails = JSON.stringify(
        emailArray.map((email) => email.toLowerCase()),
      );

      if (isNullEquivalenceEnabled) {
        additionalEmails =
          Array.isArray(emailArray) && emailArray.length === 0
            ? null
            : additionalEmails;
      }
    } catch {
      /* empty */
    }
  }

  return {
    primaryEmail,
    additionalEmails,
  };
};
