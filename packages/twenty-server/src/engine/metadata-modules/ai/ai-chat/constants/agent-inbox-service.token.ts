// Injection token for AgentInboxService to break a circular dependency:
// AiChatModule -> WorkflowToolsModule -> CoreWorkflowServicesModule
// -> WorkflowExecutorModule -> SendChatMessageActionModule -> AiChatModule
export const AGENT_INBOX_SERVICE_TOKEN = Symbol('AGENT_INBOX_SERVICE_TOKEN');
