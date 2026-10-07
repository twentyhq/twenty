import { type AgentRunConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-conversation.type';

export type AgentRunnerOpenedConversation =
  | ({ status: 'OPENED' } & AgentRunConversation)
  // the recipient deleted both the conversation its key names and the fallback one
  | { status: 'DELETED' };
