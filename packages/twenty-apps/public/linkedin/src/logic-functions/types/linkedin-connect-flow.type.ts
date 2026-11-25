import { type LinkedinConnectPendingCheckpoint } from 'src/logic-functions/types/linkedin-connect-pending-checkpoint.type';

export type LinkedinConnectFlow = {
  callbackUrl: string;
  expiresAtMs: number;
  pendingCheckpoint: LinkedinConnectPendingCheckpoint | null;
};
