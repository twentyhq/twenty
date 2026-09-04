import { type AllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';

export type QuotaCounter = LimitQuotaCounter | AllowanceQuotaCounter;
