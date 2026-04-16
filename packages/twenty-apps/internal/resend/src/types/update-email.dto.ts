export type UpdateEmailDto = {
  subject: string;
  fromAddress: string;
  toAddresses: string[];
  ccAddresses: string[];
  bccAddresses: string[];
  replyToAddresses: string[];
  lastEvent: string;
  scheduledAt: string | null;
};
