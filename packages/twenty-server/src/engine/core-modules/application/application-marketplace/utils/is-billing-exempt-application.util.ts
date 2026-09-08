import { MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-billing-exempt-applications.constant';

// Explicit chargeCredits calls and AI token usage are billed separately.
export const isBillingExemptApplication = (
  universalIdentifier: string,
): boolean =>
  MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS.includes(
    universalIdentifier,
  );
