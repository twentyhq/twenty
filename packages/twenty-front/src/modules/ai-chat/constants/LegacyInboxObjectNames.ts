import { type InboxObjectNames } from '@/ai-chat/types/InboxObjectNames';

export const LEGACY_INBOX_OBJECT_NAMES = {
  agentChatThread: 'agentChatThread',
  agentChatThreadParticipant: 'agentChatThreadParticipant',
  agentChatThreadTarget: 'agentChatThreadTarget',
  agentMessage: 'agentMessage',
  agentMessagePart: 'agentMessagePart',
  agentMessageReaction: 'agentMessageReaction',
  relationFields: {
    targetAgentChatThread: 'targetAgentChatThread',
    agentChatThreadTargets: 'agentChatThreadTargets',
    agentChatThreads: 'agentChatThreads',
    agentChatThreadParticipants: 'agentChatThreadParticipants',
    assignedAgentChatThreads: 'assignedAgentChatThreads',
    agentMessages: 'agentMessages',
    agentMessageReactions: 'agentMessageReactions',
  },
} as const satisfies InboxObjectNames;
