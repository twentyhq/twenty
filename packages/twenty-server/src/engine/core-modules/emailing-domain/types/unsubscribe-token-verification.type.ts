import { type UnsubscribeTokenPayload } from 'src/engine/core-modules/emailing-domain/types/unsubscribe-token-payload.type';

export type UnsubscribeTokenVerification = {
  payload: UnsubscribeTokenPayload;
  isExpired: boolean;
};
