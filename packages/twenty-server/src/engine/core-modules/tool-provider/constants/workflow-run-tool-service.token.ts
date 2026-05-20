// Avoids a circular dependency between ToolProviderModule and
// WorkflowRunToolsModule by going through an injection token.
export const WORKFLOW_RUN_TOOL_SERVICE_TOKEN = Symbol(
  'WORKFLOW_RUN_TOOL_SERVICE',
);
