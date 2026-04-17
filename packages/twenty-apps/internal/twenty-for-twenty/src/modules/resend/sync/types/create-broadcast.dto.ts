import type { EmailsField } from 'src/modules/resend/shared/types/emails-field';
import type { UpdateBroadcastDto } from 'src/modules/resend/sync/types/update-broadcast.dto';

export type CreateBroadcastDto = UpdateBroadcastDto & {
  name: string;
  subject: string | null;
  fromAddress: EmailsField;
  replyTo: EmailsField;
  previewText: string;
  createdAt: string;
};
