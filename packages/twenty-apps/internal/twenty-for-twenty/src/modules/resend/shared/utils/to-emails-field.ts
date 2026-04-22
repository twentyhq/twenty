import type { EmailsField } from 'src/modules/resend/shared/types/emails-field';

export const toEmailsField = (
  value: string | string[] | undefined | null,
): EmailsField => {
  if (Array.isArray(value)) {
    return {
      primaryEmail: value[0] ?? '',
      additionalEmails: value.length > 1 ? value.slice(1) : null,
    };
  }

  return { primaryEmail: value ?? '', additionalEmails: null };
};
