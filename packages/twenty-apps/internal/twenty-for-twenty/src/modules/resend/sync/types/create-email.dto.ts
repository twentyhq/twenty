import type { UpdateEmailDto } from '@modules/resend/sync/types/update-email.dto';

export type CreateEmailDto = UpdateEmailDto & {
  createdAt: string;
};
