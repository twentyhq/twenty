import { type UserCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/user-credits-fallback-mode.type';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

// The period is the current UTC week, not the workspace billing period
export type UserAllowanceQuotaCounter = {
  kind: 'userAllowance';
  key: string;
  limitValue: number;
  unit: UsageUnit.CREDIT;
  userWorkspaceId: string;
  periodStart: Date;
  periodEnd: Date;
  fallback: UserCreditsFallbackMode;
};
