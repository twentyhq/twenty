export type EmailingDomainSendEmailResult = {
  messageId: string;
  deliveredRecipients: { to: string[]; cc: string[]; bcc: string[] };
};
