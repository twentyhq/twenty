import { v4 } from 'uuid';

import { type PendingAppSend } from '@/activities/emails/types/PendingAppSend';

// a retry of the same email reuses its key so the server does not deliver it twice
export const getAppSendIdempotencyKey = ({
  pendingAppSend,
  emailKey,
}: {
  pendingAppSend: PendingAppSend | null;
  emailKey: string;
}): string =>
  pendingAppSend?.emailKey === emailKey ? pendingAppSend.idempotencyKey : v4();
