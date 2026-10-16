export type ApplicationLogEntry = {
  properties?: Record<string, unknown>;
  timestamp: Date;
  workspaceId: string;
  applicationId: string;
  logicFunctionId: string;
  logicFunctionName: string;
  executionId: string;
  level: string;
  message: string;
};
