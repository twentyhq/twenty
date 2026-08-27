import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export type UsageLimitRestResponseBody = {
  statusCode: number;
  error: string;
  messages: string[];
  limitKind: LimitKind;
  scope: {
    spenderType: SpenderType;
    spenderId: string | null;
  };
  limit: number;
  remaining: number;
  // Speed only: when retrying becomes worthwhile.
  windowSeconds?: number;
  retryAfterSeconds?: number;
  // Quota only: when the period resets.
  periodEnd?: string;
};
