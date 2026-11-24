import { isNonEmptyString, isUndefined } from '@sniptt/guards';

export const getEmailDomain = (
  emailAddress: string | undefined,
): string | undefined => {
  if (isUndefined(emailAddress) || !emailAddress.includes('@')) {
    return undefined;
  }

  const domain = emailAddress
    .slice(emailAddress.lastIndexOf('@') + 1)
    .trim()
    .toLowerCase();

  return isNonEmptyString(domain) ? domain : undefined;
};
