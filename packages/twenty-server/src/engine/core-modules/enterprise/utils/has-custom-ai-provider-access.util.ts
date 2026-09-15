/* @license Enterprise */

import { MAX_SEATS_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/enterprise/constants/max-seats-without-enterprise-key.constant';

type HasCustomAiProviderAccessArgs = {
  isBillingEnabled: boolean;
  hasValidEnterprisePlan: boolean;
  seatCount: number;
};

// Cloud runs a single instance whose seat count spans every customer, so the
// threshold would always trip; there the plan is enforced per workspace by
// billing entitlements instead.
export const hasCustomAiProviderAccess = ({
  isBillingEnabled,
  hasValidEnterprisePlan,
  seatCount,
}: HasCustomAiProviderAccessArgs): boolean =>
  isBillingEnabled ||
  hasValidEnterprisePlan ||
  seatCount <= MAX_SEATS_WITHOUT_ENTERPRISE_KEY;
