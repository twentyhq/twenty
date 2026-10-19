import { type WorkspaceAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/workspace-allowance-quota-counter.type';
import { type LimitQuotaCounter } from 'src/engine/core-modules/usage-limit/types/limit-quota-counter.type';
import { type UserAllowanceQuotaCounter } from 'src/engine/core-modules/usage-limit/types/user-allowance-quota-counter.type';

export type QuotaCounter =
  | LimitQuotaCounter
  | WorkspaceAllowanceQuotaCounter
  | UserAllowanceQuotaCounter;
