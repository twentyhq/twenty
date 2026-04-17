import type { UpdateEmailDto } from 'src/modules/resend/sync/types/update-email.dto';

export type CreateEmailDto = UpdateEmailDto & {
  htmlBody: string;
  textBody: string;
  createdAt: string;
  tags: Array<{ name: string; value: string }> | undefined;
};
