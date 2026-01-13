export type AgentType =
  | 'orchestrator'
  | 'workflow'
  | 'data'
  | 'context'
  | 'content';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  agent?: AgentType;
  timestamp: Date;
  metadata?: {
    toolCalls?: ToolCall[];
    linkedEntity?: LinkedEntity;
  };
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}

export interface LinkedEntity {
  type: 'company' | 'contact' | 'document';
  id: string;
  name: string;
}

export interface ChatSession {
  id: string;
  workspaceId: string;
  userId: string;
  messages: ChatMessage[];
  activeAgent: AgentType;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentConfig {
  type: AgentType;
  name: string;
  description: string;
  icon: string;
  tools: string[];
  systemPrompt: string;
}
