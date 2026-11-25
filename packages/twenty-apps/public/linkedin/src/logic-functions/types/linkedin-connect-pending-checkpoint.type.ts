import { type UnipileAuthCheckpoint } from 'src/unipile/types/unipile-auth-checkpoint.type';

export type LinkedinConnectPendingCheckpoint = {
  intentId: string;
  checkpoint: UnipileAuthCheckpoint;
};
