import { isNonEmptyString } from '@sniptt/guards';

export const getPrimaryEmailFromRecord = (
  record: Record<string, unknown>,
): string | null => {
  const emails = record.emails;

  if (emails === null || typeof emails !== 'object') {
    return null;
  }

  const primaryEmail = (emails as { primaryEmail?: unknown }).primaryEmail;

  return isNonEmptyString(primaryEmail) ? primaryEmail : null;
};
