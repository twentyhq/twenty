import { isNonEmptyString } from '@sniptt/guards';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transformEmailsValue = (value: any): any => {
  if (!value) {
    return value;
  }

  let additionalEmails = value?.additionalEmails;
  const primaryEmail = value?.primaryEmail
    ? value.primaryEmail.toLowerCase()
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
    } catch {
      /* empty */
    }
  }

  return {
    primaryEmail,
    additionalEmails,
  };
};
