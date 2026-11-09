import { type OutboundRequestOutcomeDetails } from 'src/engine/core-modules/secure-http-client/outbound-request-outcome-details.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export type HttpEgressResponse = {
  toolOutput: ToolOutput;
  outcomeDetails: OutboundRequestOutcomeDetails;
};
