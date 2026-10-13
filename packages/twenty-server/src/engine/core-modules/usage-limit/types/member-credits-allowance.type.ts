import { type MemberCreditsFallbackMode } from 'src/engine/core-modules/usage-limit/types/member-credits-fallback-mode.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

// The period is the member's current slice, not the workspace billing period
export type MemberCreditsAllowance = UsagePeriod & {
  amountMicro: number;
  fallback: MemberCreditsFallbackMode;
};
