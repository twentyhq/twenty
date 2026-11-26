import { type InboxObjectNames } from '@/ai-chat/types/InboxObjectNames';

export const INBOX_OBJECT_NAMES = {
  agentChatThread: 'inboxThread',
  agentChatThreadParticipant: 'inboxThreadParticipant',
  agentChatThreadTarget: 'inboxThreadTarget',
  agentMessage: 'inboxMessage',
  agentMessagePart: 'inboxMessagePart',
  agentMessageReaction: 'inboxMessageReaction',
  relationFields: {
    targetAgentChatThread: 'targetInboxThread',
    agentChatThreadTargets: 'inboxThreadTargets',
    agentChatThreads: 'inboxThreads',
    agentChatThreadParticipants: 'inboxThreadParticipants',
    assignedAgentChatThreads: 'assignedInboxThreads',
    agentMessages: 'inboxMessages',
    agentMessageReactions: 'inboxMessageReactions',
  },
} as const satisfies InboxObjectNames;
