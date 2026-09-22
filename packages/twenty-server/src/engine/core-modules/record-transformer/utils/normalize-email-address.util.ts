import { domainToUnicode } from 'node:url';

import { isNonEmptyString } from '@sniptt/guards';

export const normalizeEmailAddress = (email: string): string => {
  const separatorIndex = email.lastIndexOf('@');

  if (separatorIndex === -1) {
    return email.toLowerCase();
  }

  const localPart = email.slice(0, separatorIndex).toLowerCase();
  const domain = email.slice(separatorIndex + 1);
  const unicodeDomain = domainToUnicode(domain);
  const normalizedDomain = isNonEmptyString(unicodeDomain)
    ? unicodeDomain
    : domain.toLowerCase();

  return `${localPart}@${normalizedDomain.replace(/\.+$/u, '')}`;
};
