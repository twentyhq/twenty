import { isDefined } from 'twenty-shared/utils';

export type LegacySendEmailInput = {
  connectedAccountId: string;
  email?: string;
  recipients?: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
  };
  subject?: string;
  body?: string;
  files?: unknown[];
};

export type MigratedSendEmailInput = {
  connectedAccountId: string;
  recipients: {
    to: string;
    cc: string;
    bcc: string;
  };
  subject?: string;
  body?: string;
  files?: unknown[];
};

export const arrayToCommaSeparatedString = (
  value: string | string[] | undefined,
): string => {
  if (!isDefined(value)) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.filter((v) => v.trim().length > 0).join(', ');
  }

  return value;
};

export const migrateSendEmailInput = (
  input: LegacySendEmailInput,
): MigratedSendEmailInput => {
  const { email, recipients, ...rest } = input;

  let toValue = '';
  let ccValue = '';
  let bccValue = '';

  if (isDefined(recipients)) {
    toValue = arrayToCommaSeparatedString(recipients.to);
    ccValue = arrayToCommaSeparatedString(recipients.cc);
    bccValue = arrayToCommaSeparatedString(recipients.bcc);
  }

  if (isDefined(email) && email.trim().length > 0 && toValue.length === 0) {
    toValue = email;
  }

  return {
    ...rest,
    recipients: {
      to: toValue,
      cc: ccValue,
      bcc: bccValue,
    },
  };
};

export const needsSendEmailMigration = (
  input: LegacySendEmailInput,
): boolean => {
  if (isDefined(input.email)) {
    return true;
  }

  if (isDefined(input.recipients)) {
    if (Array.isArray(input.recipients.to)) {
      return true;
    }
    if (Array.isArray(input.recipients.cc)) {
      return true;
    }
    if (Array.isArray(input.recipients.bcc)) {
      return true;
    }
  }

  return false;
};
