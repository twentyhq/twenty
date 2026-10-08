import { UNSUBSCRIBE_TOKEN_MAX_AGE_MS } from 'src/engine/core-modules/emailing-domain/constants/unsubscribe-token-max-age-ms.constant';

type IsUnsubscribeTokenExpiredArgs = {
  issuedAt: number;
  now: number;
  maxAgeMs?: number;
};

export const isUnsubscribeTokenExpired = ({
  issuedAt,
  now,
  maxAgeMs = UNSUBSCRIBE_TOKEN_MAX_AGE_MS,
}: IsUnsubscribeTokenExpiredArgs): boolean => now - issuedAt > maxAgeMs;
