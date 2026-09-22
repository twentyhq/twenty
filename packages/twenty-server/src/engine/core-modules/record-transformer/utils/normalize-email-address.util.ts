import { domainToUnicode } from 'url';

import { isNonEmptyString } from '@sniptt/guards';

export const normalizeEmailAddress = (email: string): string => {
  const separatorIndex = email.lastIndexOf('@');

  if (separatorIndex === -1) {
    return email.toLowerCase();
  }

  const localPart = email.slice(0, separatorIndex).toLowerCase();
  const domain = email
    .slice(separatorIndex + 1)
    .replace(/[。．｡]/gu, '.')
    .replace(/\.+$/u, '')
    .toLowerCase();
  const unicodeDomain = domainToUnicode(domain);

  return `${localPart}@${isNonEmptyString(unicodeDomain) ? unicodeDomain : domain}`;
};

export const normalizeEmailsSubfieldValue = (
  subFieldName: string | undefined,
  value: unknown,
): unknown => {
  if (subFieldName === 'primaryEmail' && isNonEmptyString(value)) {
    return normalizeEmailAddress(value);
  }

  if (subFieldName === 'additionalEmails') {
    let emails = value;

    if (isNonEmptyString(emails)) {
      try {
        emails = JSON.parse(emails);
      } catch {
        return value;
      }
    }

    if (Array.isArray(emails)) {
      return emails.map((email) =>
        isNonEmptyString(email) ? normalizeEmailAddress(email) : email,
      );
    }
  }

  return value;
};
