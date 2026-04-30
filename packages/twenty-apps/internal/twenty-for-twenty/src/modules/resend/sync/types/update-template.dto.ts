import type { EmailsField } from '@modules/resend/shared/types/emails-field';

export type UpdateTemplateDto = {
  name: string;
  alias: string;
  status: string;
  resendUpdatedAt: string;
  publishedAt: string | null;
  fromAddress?: EmailsField;
  subject?: string;
  replyTo?: EmailsField;
  htmlBody?: string;
  textBody?: string;
};
