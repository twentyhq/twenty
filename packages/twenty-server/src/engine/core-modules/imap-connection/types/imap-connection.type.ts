export type ConnectionParameters = {
  host: string;
  port: number;
  username: string;
  password: string;
  secure?: boolean;
};

export type AccountType = 'IMAP' | 'SMTP' | 'CALDAV';

export type IMAP_SMTP_CALDEVParams = {
  handle: string;
  IMAP?: ConnectionParameters;
  SMTP?: ConnectionParameters;
  CALDAV?: ConnectionParameters;
};
