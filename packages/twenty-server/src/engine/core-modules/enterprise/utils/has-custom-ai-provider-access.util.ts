/* @license Enterprise */

import { MAX_SEATS_WITHOUT_ENTERPRISE_KEY } from 'src/engine/core-modules/enterprise/constants/max-seats-without-organization-key.constant';

type HasCustomAiProviderAccessArgs = {
  isBillingEnabled: boolean;
  hasValidEnterprisePlan: boolean;
  seatCount: number;
};

// Cloud's seat count spans every customer, so there billing entitlements enforce the plan per workspace.
export const hasCustomAiProviderAccess = ({
  isBillingEnabled,
  hasValidEnterprisePlan,
  seatCount,
}: HasCustomAiProviderAccessArgs): boolean =>
  isBillingEnabled ||
  hasValidEnterprisePlan ||
  seatCount <= MAX_SEATS_WITHOUT_ENTERPRISE_KEY;
