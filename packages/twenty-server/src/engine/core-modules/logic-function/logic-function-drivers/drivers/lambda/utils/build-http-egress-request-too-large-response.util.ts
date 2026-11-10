import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

export const buildHttpEgressRequestTooLargeResponse = ({
  request: { input },
  startedAt,
}: {
  request: HttpEgressRequest;
  startedAt: number;
}): HttpEgressResponse => ({
  toolOutput: {
    success: false,
    message: `HTTP ${input.method} request to ${input.url} failed`,
    error: 'The request is too large to send',
  },
  outcomeDetails: {
    outcome: 'other-error',
    durationMs: Date.now() - startedAt,
    errorCode: 'REQUEST_TOO_LARGE',
  },
});
