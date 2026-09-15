import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/twenty-public-app-universal-identifiers.constant';

// These apps run on every imported record or subscribed event, so metering
// each invocation would drain the free-tier allowance.
export const MARKETPLACE_BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS: string[] = [
  TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CALL_RECORDER,
  TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.LAST_CONTACT,
  TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.SLACK,
  TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.FATHOM,
];
