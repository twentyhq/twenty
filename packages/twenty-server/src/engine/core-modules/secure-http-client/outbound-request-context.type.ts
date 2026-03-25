import { type OutboundRequestSource } from './outbound-request-source.type';

export type OutboundRequestContext = {
  workspaceId: string;
  source: OutboundRequestSource;
  userId?: string;
};
