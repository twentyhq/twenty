export type CreateTemplateDto = {
  name: string;
  alias: string;
  status: string;
  fromAddress: string | string[];
  subject: string;
  replyTo: string | string[];
  htmlBody: string;
  textBody: string;
  createdAt: string;
  resendUpdatedAt: string;
  publishedAt: string | null;
};
