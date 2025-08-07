import { type ConnectionParameters } from '~/generated/graphql';

export type ImapSmtpCaldavAccount = {
  IMAP?: ConnectionParameters;
  SMTP?: ConnectionParameters;
  CALDAV?: ConnectionParameters;
};
