import { type LimitKind } from 'src/engine/core-modules/usage-limit/types/limit-kind.type';
import { type PeriodUnit } from 'src/engine/core-modules/usage-limit/types/period-unit.type';
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
  periodCount: number;
  periodUnit: PeriodUnit;
  retryAfterSeconds: number;
};
