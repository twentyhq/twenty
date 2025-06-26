export type ConnectionParameters = {
  host: string;
  port: number;
  username: string;
  password: string;
  secure?: boolean;
};

export type AccountType = 'IMAP' | 'SMTP' | 'CALDAV';

export type ImapSmtpCaldavParams = {
  handle: string;
  IMAP?: ConnectionParameters;
  SMTP?: ConnectionParameters;
  CALDAV?: ConnectionParameters;
};
