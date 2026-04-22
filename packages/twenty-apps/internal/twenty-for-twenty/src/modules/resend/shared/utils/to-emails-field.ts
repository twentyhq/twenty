import type { EmailsField } from '@modules/resend/shared/types/emails-field';

const extractEmailAddress = (raw: string): string => {
  const trimmed = raw.trim();

  const closingIndex = trimmed.lastIndexOf('>');
  const openingIndex = trimmed.lastIndexOf('<', closingIndex);

  if (openingIndex !== -1 && closingIndex > openingIndex) {
    return trimmed.slice(openingIndex + 1, closingIndex).trim().toLowerCase();
  }

  return trimmed.toLowerCase();
};

export const toEmailsField = (
  value: string | string[] | undefined | null,
): EmailsField => {
  if (Array.isArray(value)) {
    const normalized = value.map(extractEmailAddress);

    return {
      primaryEmail: normalized[0] ?? '',
      additionalEmails: normalized.length > 1 ? normalized.slice(1) : null,
    };
  }

  return {
    primaryEmail: typeof value === 'string' ? extractEmailAddress(value) : '',
    additionalEmails: null,
  };
};
