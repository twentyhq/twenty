import { isNonEmptyString } from '@sniptt/guards';

export const getEmailDomain = (
  emailAddress: string | undefined,
): string | undefined => {
  const domain = emailAddress?.split('@')[1]?.trim().toLowerCase();

  return isNonEmptyString(domain) ? domain : undefined;
};
