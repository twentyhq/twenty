import { isAxiosError } from 'axios';
import { isUndefined } from '@sniptt/guards';

import { type OutboundRequestOutcomeDetails } from 'src/engine/core-modules/secure-http-client/outbound-request-outcome-details.type';
import { findOutboundRequestBlockedError } from 'src/engine/core-modules/secure-http-client/utils/find-outbound-request-blocked-error.util';
import { getOutboundRequestOutcome } from 'src/engine/core-modules/secure-http-client/utils/get-outbound-request-outcome.util';

export const describeOutboundRequestError = (
  error: unknown,
): Omit<OutboundRequestOutcomeDetails, 'durationMs'> => {
  const outcome = getOutboundRequestOutcome(error);

  return {
    outcome,
    status: isAxiosError(error) ? error.response?.status : undefined,
    errorCode:
      isAxiosError(error) && isUndefined(error.response)
        ? error.code
        : undefined,
    reason:
      outcome === 'blocked'
        ? findOutboundRequestBlockedError(error)?.message
        : undefined,
  };
};
