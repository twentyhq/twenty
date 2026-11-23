import { type OutboundRequestOutcome } from 'src/engine/core-modules/secure-http-client/outbound-request-outcome.type';

export type OutboundRequestOutcomeDetails = {
  outcome: OutboundRequestOutcome;
  durationMs: number;
  status?: number;
  errorCode?: string;
  reason?: string;
};
