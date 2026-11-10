import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

export const buildHttpEgressRequestTooLargeResponse = (
  startedAt: number,
): HttpEgressResponse => ({
  errorMessage: 'The request is too large to send',
  outcomeDetails: {
    outcome: 'other-error',
    durationMs: Date.now() - startedAt,
    errorCode: 'REQUEST_TOO_LARGE',
  },
});
