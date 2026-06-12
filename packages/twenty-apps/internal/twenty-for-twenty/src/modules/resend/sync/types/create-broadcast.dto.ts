import type { UpdateBroadcastDto } from '@modules/resend/sync/types/update-broadcast.dto';

export type CreateBroadcastDto = UpdateBroadcastDto & {
  name: string;
  createdAt: string;
};
