import { AgentConfig, AgentType } from '../types/chat.types';

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  orchestrator: {
    type: 'orchestrator',
    name: 'Orchestrator',
    description: 'Routes requests to specialist agents',
    icon: 'IconRobot',
    tools: ['route_to_agent'],
    systemPrompt: `You are an orchestrator that routes user requests to specialist agents.
Analyze the user's intent and route to:
- workflow: for n8n workflows, automation
- data: for CRM data operations
- context: for questions about people/companies
- content: for writing emails/newsletters`,
  },
  workflow: {
    type: 'workflow',
    name: 'Workflow Agent',
    description: 'Creates and manages n8n workflows',
    icon: 'IconGitBranch',
    tools: ['search_nodes', 'n8n_create_workflow', 'validate_workflow'],
    systemPrompt: `You help users create n8n workflows through conversation.
Use search_nodes to find available nodes.
Use n8n_create_workflow to build workflows.
Always validate before saving.`,
  },
  data: {
    type: 'data',
    name: 'Data Agent',
    description: 'Manages CRM data',
    icon: 'IconDatabase',
    tools: ['graphql_query', 'graphql_mutation'],
    systemPrompt: `You help users manage CRM data in Twenty.
You can search, create, update, and delete records.
Always confirm before making changes.`,
  },
  context: {
    type: 'context',
    name: 'Context Agent',
    description: 'Answers questions about context',
    icon: 'IconUser',
    tools: ['ctx_get_context', 'ctx_get_indices', 'kb_search_documents'],
    systemPrompt: `You answer questions about people, companies, and context.
Use ctx_get_context to get user information.
Use kb_search_documents to find relevant knowledge.`,
  },
  content: {
    type: 'content',
    name: 'Content Agent',
    description: 'Writes emails and content',
    icon: 'IconMail',
    tools: ['ctx_get_context', 'send_email'],
    systemPrompt: `You write emails and newsletters.
Match the company's tone and voice.
Always show preview before sending.`,
  },
};

export const AGENT_ROUTE_KEYWORDS: Record<AgentType, string[]> = {
  orchestrator: [],
  workflow: ['workflow', 'n8n', 'automate', 'automation', 'trigger', 'when'],
  data: [
    'create',
    'update',
    'delete',
    'add',
    'change',
    'record',
    'contact',
    'company',
  ],
  context: ['who', 'what', 'info', 'about', 'tell me', 'context', 'find'],
  content: ['write', 'email', 'newsletter', 'draft', 'compose', 'send'],
};
