// The full spender tuple of one consumption, passed explicitly because quota
// enforcement runs in contexts (workers, workflow steps) whose spenders never
// reach the auth context.
export type UsageSpenders = {
  userWorkspaceId?: string | null;
  apiKeyId?: string | null;
  applicationId?: string | null;
  agentId?: string | null;
  workflowId?: string | null;
  workflowRunId?: string | null;
  logicFunctionId?: string | null;
};
