import { isAxiosError } from 'axios';
import { isDefined } from 'twenty-shared/utils';

import { type OutboundRequestOutcome } from 'src/engine/core-modules/secure-http-client/outbound-request-outcome.type';
import { findOutboundRequestBlockedError } from 'src/engine/core-modules/secure-http-client/utils/find-outbound-request-blocked-error.util';

// ERR_CANCELED comes from the AbortSignal.timeout every client request carries
const TIMEOUT_ERROR_CODES = new Set([
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_CANCELED',
]);

export const getOutboundRequestOutcome = (
  error: unknown,
): OutboundRequestOutcome => {
  if (isDefined(findOutboundRequestBlockedError(error))) {
    return 'blocked';
  }

  if (!isAxiosError(error)) {
    return 'other-error';
  }

  if (isDefined(error.response)) {
    return 'http-error';
  }

  if (isDefined(error.code) && TIMEOUT_ERROR_CODES.has(error.code)) {
    return 'timeout';
  }

  return 'network-error';
};
