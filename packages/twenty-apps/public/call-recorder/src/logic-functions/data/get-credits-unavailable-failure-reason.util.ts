import { getCreditAvailability } from 'twenty-sdk/billing';

import { FAILURE_REASON_BY_CREDIT_UNAVAILABLE_REASON } from 'src/logic-functions/constants/failure-reason-by-credit-unavailable-reason';

export const getCreditsUnavailableFailureReason = async (): Promise<
  string | undefined
> => {
  const creditAvailability = await getCreditAvailability();

  return creditAvailability.hasAvailableCredits
    ? undefined
    : FAILURE_REASON_BY_CREDIT_UNAVAILABLE_REASON[creditAvailability.reason];
};
