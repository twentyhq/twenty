import { ACCOUNT_TYPES } from 'src/engine/core-modules/imap-smtp-caldav-connection/constants/account-types.constant';

export type ConnectionParameters = {
  host: string;
  port: number;
  username?: string;
  password: string;
  secure?: boolean;
};

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export type ImapSmtpCaldavParams = {
  IMAP?: ConnectionParameters;
  SMTP?: ConnectionParameters;
  CALDAV?: ConnectionParameters;
};
