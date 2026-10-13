import { type CreditCounterCheck } from 'src/engine/core-modules/usage-limit/types/credit-counter-check.type';
import { type MemberCreditsAllowance } from 'src/engine/core-modules/usage-limit/types/member-credits-allowance.type';
import { type MemberCreditsCounterCheck } from 'src/engine/core-modules/usage-limit/types/member-credits-counter-check.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export type MemberCreditsCounterCheckReport = {
  allowance: UsagePeriod & {
    limitValueMicro: number;
    check: CreditCounterCheck;
  };
  memberCredits:
    | (MemberCreditsAllowance & {
        memberChecks: MemberCreditsCounterCheck[];
        idleMemberCount: number;
      })
    | null;
};
