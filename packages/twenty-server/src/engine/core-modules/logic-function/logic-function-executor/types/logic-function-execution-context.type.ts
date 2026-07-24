export enum LogicFunctionExecutionSource {
  MANUAL = 'MANUAL',
  WORKFLOW = 'WORKFLOW',
  CRON = 'CRON',
  DATABASE_EVENT = 'DATABASE_EVENT',
  HTTP_ROUTE = 'HTTP_ROUTE',
  SERVER_ROUTE = 'SERVER_ROUTE',
  TOOL = 'TOOL',
}

export type LogicFunctionExecutionContext = {
  source: LogicFunctionExecutionSource;
  workflowId?: string;
  workflowVersionId?: string;
  workflowRunId?: string;
};
