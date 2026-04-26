export type AiCallContext = {
  workspaceId: string;
  userWorkspaceId?: string | null;
  agentId?: string | null;
  workflowRunId?: string | null;
  threadId?: string | null;
  turnId?: string | null;
};
