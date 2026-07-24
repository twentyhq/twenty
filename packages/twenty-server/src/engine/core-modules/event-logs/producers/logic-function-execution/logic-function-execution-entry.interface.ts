export type LogicFunctionExecutionEntry = {
  timestamp: Date;
  workspaceId: string;
  applicationId: string;
  logicFunctionId: string;
  logicFunctionName: string;
  executionId: string;
  status: string;
  errorType: string;
  durationMs: number;
  creditsUsedMicro: number;
  source: string;
  workflowId: string;
  workflowVersionId: string;
  workflowRunId: string;
  executionMode: string;
};
