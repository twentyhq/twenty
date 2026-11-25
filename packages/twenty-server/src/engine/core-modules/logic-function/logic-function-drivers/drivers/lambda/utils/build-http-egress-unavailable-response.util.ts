import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

export const HTTP_EGRESS_UNAVAILABLE_ERROR_CODE = 'EGRESS_UNAVAILABLE';

export const buildHttpEgressUnavailableResponse = ({
  request: { limits },
  startedAt,
  isTimeout,
  reason,
}: {
  request: HttpEgressRequest;
  startedAt: number;
  isTimeout: boolean;
  reason?: string;
}): HttpEgressResponse => ({
  errorMessage: isTimeout
    ? `Request timed out after ${limits.timeoutMs / 1_000}s`
    : 'Outbound HTTP requests are temporarily unavailable. Try again later.',
  outcomeDetails: {
    outcome: isTimeout ? 'timeout' : 'other-error',
    durationMs: Date.now() - startedAt,
    errorCode: isTimeout ? undefined : HTTP_EGRESS_UNAVAILABLE_ERROR_CODE,
    reason: isTimeout ? undefined : reason,
  },
});
