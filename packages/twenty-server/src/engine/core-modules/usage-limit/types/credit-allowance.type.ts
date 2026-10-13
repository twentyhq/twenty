import { type CreditAllowanceGrant } from 'src/engine/core-modules/usage-limit/types/credit-allowance-grant.type';
import { type MemberCreditsAllowance } from 'src/engine/core-modules/usage-limit/types/member-credits-allowance.type';
import { type UsagePeriod } from 'src/engine/core-modules/usage-limit/types/usage-period.type';

export type CreditAllowance = UsagePeriod & {
  planAllowanceMicro: number;
  grants: CreditAllowanceGrant[];
  memberCredits: MemberCreditsAllowance | null;
};
