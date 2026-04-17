import type { EmailsField } from 'src/modules/resend/utils/to-emails-field';

export type CreateTemplateDto = {
  name: string;
  alias: string;
  status: string;
  fromAddress: EmailsField;
  subject: string;
  replyTo: EmailsField;
  htmlBody: string;
  textBody: string;
  createdAt: string;
  resendUpdatedAt: string;
  publishedAt: string | null;
};
