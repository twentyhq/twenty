import { isAxiosError } from 'axios';
import { isString, isUndefined } from '@sniptt/guards';

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
  if (!isUndefined(findOutboundRequestBlockedError(error))) {
    return 'blocked';
  }

  if (!isAxiosError(error)) {
    return 'other-error';
  }

  if (!isUndefined(error.response)) {
    return 'http-error';
  }

  if (isString(error.code) && TIMEOUT_ERROR_CODES.has(error.code)) {
    return 'timeout';
  }

  return 'network-error';
};
