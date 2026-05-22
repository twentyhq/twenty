// Injection token for WorkflowRunToolWorkspaceService to break circular dependency:
// ToolProviderModule -> WorkflowRunToolsModule -> WorkflowTriggerModule
// -> WorkflowRunnerModule -> WorkflowExecutorModule -> AiAgentActionModule
// -> AiAgentExecutionModule -> ToolProviderModule
//
// (Same cycle as WORKFLOW_TOOL_SERVICE_TOKEN — both depend on the workflow runner.)
export const WORKFLOW_RUN_TOOL_SERVICE_TOKEN = Symbol(
  'WORKFLOW_RUN_TOOL_SERVICE',
);
