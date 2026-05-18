import { type ConnectionParametersInput } from '~/generated-metadata/graphql';

export type ImapSmtpCaldavAccount = {
  IMAP?: ConnectionParametersInput;
  SMTP?: ConnectionParametersInput;
  CALDAV?: ConnectionParametersInput;
};
