import { type ConnectionParameters } from '~/generated-metadata/graphql';

export type ImapSmtpCaldavAccount = {
  IMAP?: ConnectionParameters;
  SMTP?: ConnectionParameters;
  CALDAV?: ConnectionParameters;
};
