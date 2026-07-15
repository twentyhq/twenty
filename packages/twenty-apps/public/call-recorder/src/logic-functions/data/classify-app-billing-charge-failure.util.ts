import { RestApiClientError } from 'twenty-client-sdk/rest';

import { type AppBillingChargeOutcome } from 'src/logic-functions/types/app-billing-charge-outcome.type';

export const classifyAppBillingChargeFailure = (
  error: unknown,
): Exclude<AppBillingChargeOutcome, 'charged'> => {
  if (error instanceof RestApiClientError && error.status === 404) {
    return 'billing-disabled';
  }

  // No status means the request never reached billing.
  if (error instanceof RestApiClientError) {
    return error.status === undefined || error.status < 500
      ? 'rejected'
      : 'unknown';
  }

  return 'unknown';
};
