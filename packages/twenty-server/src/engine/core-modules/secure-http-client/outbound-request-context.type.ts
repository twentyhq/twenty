import { type OutboundRequestSource } from './outbound-request-source.type';

export type OutboundRequestContext = {
  workspaceId: string;
  source: OutboundRequestSource;
  userId?: string;
  userWorkspaceId?: string;
  workspaceMemberId?: string;
  workflowRunId?: string;
  workflowStepId?: string;
};
