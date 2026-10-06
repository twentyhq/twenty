import { type CreditAllowanceGrant } from 'src/engine/core-modules/usage-limit/types/credit-allowance-grant.type';

export type CreditAllowanceSchedule = {
  planAllowanceMicro: number;
  grants: CreditAllowanceGrant[];
};
