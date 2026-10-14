/* @license Enterprise */

import { type BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';

export type CreditsUsage = {
  productKey: BillingProductKey;
  periodStart: Date;
  periodEnd: Date;
  workspaceCreditsUsedMicro: number;
  workspaceCreditsGrantedMicro: number;
  workspaceCreditsRolledOverMicro: number;
  workspaceCreditsTotalMicro: number;
  userCreditsUsedMicro: number;
  unitPriceCents: number;
};
