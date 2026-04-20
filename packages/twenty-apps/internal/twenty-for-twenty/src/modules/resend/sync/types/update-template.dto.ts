import type { EmailsField } from 'src/modules/resend/shared/types/emails-field';

export type UpdateTemplateDto = {
  name: string;
  alias: string;
  status: string;
  fromAddress: EmailsField;
  subject: string;
  replyTo: EmailsField;
  htmlBody: string;
  textBody: string;
  resendUpdatedAt: string;
  publishedAt: string | null;
};
