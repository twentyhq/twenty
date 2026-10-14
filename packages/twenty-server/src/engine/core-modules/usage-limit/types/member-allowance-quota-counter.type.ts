import { type MemberCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/member-credits-fallback-mode.type';
import { type UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

// The period is the current UTC week, not the workspace billing period
export type MemberAllowanceQuotaCounter = {
  kind: 'memberAllowance';
  key: string;
  limitValue: number;
  unit: UsageUnit.CREDIT;
  userWorkspaceId: string;
  periodStart: Date;
  periodEnd: Date;
  fallback: MemberCreditsFallbackMode;
};
