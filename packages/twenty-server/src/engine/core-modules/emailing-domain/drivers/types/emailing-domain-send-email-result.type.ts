export type EmailingDomainSendEmailResult = {
  messageId: string;
  headerMessageId: string | null;
  deliveredRecipients: { to: string[]; cc: string[]; bcc: string[] };
};
