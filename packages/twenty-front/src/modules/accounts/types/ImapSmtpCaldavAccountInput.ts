import { type ConnectionParametersInput } from '~/generated-metadata/graphql';

export type ImapSmtpCaldavAccountInput = {
  IMAP?: ConnectionParametersInput;
  SMTP?: ConnectionParametersInput;
  CALDAV?: ConnectionParametersInput;
};
