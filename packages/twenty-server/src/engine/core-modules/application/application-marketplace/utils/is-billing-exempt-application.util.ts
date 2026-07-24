import { MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-billing-exempt-applications.constant';

// Logic-function executions for these first-party apps (Call Recorder,
// Last contact) do not consume the workspace's credits. Explicit chargeCredits
// calls and AI token usage from within the function are billed separately.
export const isBillingExemptApplication = (
  universalIdentifier: string,
): boolean =>
  MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS.includes(
    universalIdentifier,
  );
