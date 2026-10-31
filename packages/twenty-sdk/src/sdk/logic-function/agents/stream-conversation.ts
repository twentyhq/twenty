import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';

import { type AgentConversationInput } from '@/sdk/logic-function/agents/types/agent-conversation.type';
import { streamAgentChatEvents } from '@/sdk/logic-function/utils/stream-agent-chat-events.util';

const ON_AGENT_CHAT_EVENT_SUBSCRIPTION = `
  subscription OnAgentChatEvent($agentUniversalIdentifier: UUID!, $threadKey: String!) {
    onAgentChatEvent(agentUniversalIdentifier: $agentUniversalIdentifier, threadKey: $threadKey) {
      event
    }
  }
`;

export type StreamConversationInput = AgentConversationInput & {
  signal?: AbortSignal;
};

// a dropped connection throws: read the history and stream again to resume
export const streamConversation = ({
  signal,
  ...conversation
}: StreamConversationInput): AsyncGenerator<AgentChatSubscriptionEvent> =>
  streamAgentChatEvents({
    query: ON_AGENT_CHAT_EVENT_SUBSCRIPTION,
    variables: conversation,
    caller: 'streamConversation',
    signal,
  });
