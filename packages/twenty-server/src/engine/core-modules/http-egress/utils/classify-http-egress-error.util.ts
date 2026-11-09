import { isAxiosError } from 'axios';
import { isDefined } from 'twenty-shared/utils';

import { type HttpEgressDiagnostics } from 'src/engine/core-modules/http-egress/types/http-egress-diagnostics.type';
import { findSsrfBlockedException } from 'src/engine/core-modules/http-egress/utils/find-ssrf-blocked-exception.util';

const TIMEOUT_ERROR_CODES = new Set([
  'ERR_CANCELED',
  'ECONNABORTED',
  'ETIMEDOUT',
]);

const isPayloadTooLargeError = (error: Error & { code?: string }): boolean =>
  error.code === 'ERR_FR_MAX_BODY_LENGTH_EXCEEDED' ||
  error.message.startsWith('maxContentLength size of') ||
  error.message.startsWith('Request body larger than maxBodyLength');

export const classifyHttpEgressError = (
  error: unknown,
): Omit<HttpEgressDiagnostics, 'durationMs'> => {
  const ssrfBlockedException = findSsrfBlockedException(error);

  if (isDefined(ssrfBlockedException)) {
    return {
      outcome: 'blocked',
      resolvedAddress: ssrfBlockedException.address,
    };
  }

  if (!isAxiosError(error)) {
    return { outcome: 'invalid_request' };
  }

  if (isDefined(error.response)) {
    return {
      outcome: 'http_error',
      status: error.response.status,
      resolvedAddress: error.request?.socket?.remoteAddress,
    };
  }

  if (isDefined(error.code) && TIMEOUT_ERROR_CODES.has(error.code)) {
    return { outcome: 'timeout' };
  }

  if (isPayloadTooLargeError(error)) {
    return { outcome: 'payload_too_large' };
  }

  return { outcome: 'network_error' };
};
