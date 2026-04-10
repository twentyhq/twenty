export type ApplicationLogEntry = {
  timestamp: Date;
  workspaceId: string;
  applicationId: string;
  logicFunctionId: string;
  logicFunctionName: string;
  executionId: string;
  level: string;
  message: string;
};
