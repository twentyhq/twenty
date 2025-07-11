export type ConnectionParameters = {
  host: string;
  port: number;
  password: string;
  secure?: boolean;
};

export type AccountType = 'IMAP' | 'SMTP' | 'CALDAV';

export type ImapSmtpCaldavParams = {
  IMAP?: ConnectionParameters;
  SMTP?: ConnectionParameters;
  CALDAV?: ConnectionParameters;
};
