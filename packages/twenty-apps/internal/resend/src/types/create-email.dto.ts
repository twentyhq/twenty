export type CreateEmailDto = {
  subject: string;
  fromAddress: string;
  toAddresses: string[];
  htmlBody: string;
  textBody: string;
  ccAddresses: string[];
  bccAddresses: string[];
  replyToAddresses: string[];
  lastEvent: string;
  createdAt: string;
  scheduledAt: string | null;
  tags: Array<{ name: string; value: string }> | undefined;
};
