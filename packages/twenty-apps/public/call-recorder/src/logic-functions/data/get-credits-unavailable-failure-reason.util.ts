import { getCreditAvailability } from 'twenty-sdk/billing';

import { CREDITS_UNAVAILABLE_FAILURE_REASONS } from 'src/logic-functions/constants/credits-unavailable-failure-reasons';

export const getCreditsUnavailableFailureReason = async (): Promise<
  string | undefined
> => {
  const creditAvailability = await getCreditAvailability();

  return creditAvailability.hasAvailableCredits
    ? undefined
    : CREDITS_UNAVAILABLE_FAILURE_REASONS[creditAvailability.reason];
};
