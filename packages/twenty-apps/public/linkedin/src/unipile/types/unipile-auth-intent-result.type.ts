import { type UnipileAuthCheckpoint } from 'src/unipile/types/unipile-auth-checkpoint.type';

export type UnipileAuthIntentResult =
  | { object: 'Account'; id: string }
  | {
      object: 'AuthenticationCheckpoint';
      intent_id: string;
      checkpoint: UnipileAuthCheckpoint;
    }
  | { object: 'AuthenticationQrCode' | 'OauthUrl' };
