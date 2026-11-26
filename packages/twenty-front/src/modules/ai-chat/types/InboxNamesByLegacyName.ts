import { type InboxObjectNamesByLegacyName } from 'twenty-shared/ai';

export type InboxNamesByLegacyName = InboxObjectNamesByLegacyName & {
  relationFields: {
    targetAgentChatThread: string;
    agentChatThreadTargets: string;
    agentChatThreads: string;
    agentChatThreadParticipants: string;
    assignedAgentChatThreads: string;
    agentMessages: string;
    agentMessageReactions: string;
  };
};
