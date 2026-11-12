import { type OutboundRequestOutcomeDetails } from 'src/engine/core-modules/secure-http-client/outbound-request-outcome-details.type';

// The HTTP response when one was received, the error message otherwise, and the outcome to log.
export type HttpEgressResponse = {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: unknown;
  errorMessage?: string;
  outcomeDetails: OutboundRequestOutcomeDetails;
};
