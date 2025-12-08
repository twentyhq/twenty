// Injection token for WorkflowToolWorkspaceService to break circular dependency:
// ToolProviderModule -> WorkflowToolsModule -> WorkflowTriggerModule
// -> WorkflowRunnerModule -> WorkflowExecutorModule -> AiAgentActionModule
// -> AiAgentExecutionModule -> ToolProviderModule
export const WORKFLOW_TOOL_SERVICE_TOKEN = Symbol(
  'WORKFLOW_TOOL_SERVICE_TOKEN',
);
