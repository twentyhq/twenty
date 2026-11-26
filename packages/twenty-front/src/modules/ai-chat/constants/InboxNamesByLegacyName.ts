import { INBOX_OBJECT_NAMES_BY_LEGACY_NAME } from 'twenty-shared/ai';

import { type InboxNamesByLegacyName } from '@/ai-chat/types/InboxNamesByLegacyName';

export const INBOX_NAMES_BY_LEGACY_NAME = {
  ...INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
  relationFields: {
    targetAgentChatThread: 'targetInboxThread',
    agentChatThreadTargets: 'inboxThreadTargets',
    agentChatThreads: 'inboxThreads',
    agentChatThreadParticipants: 'inboxThreadParticipants',
    assignedAgentChatThreads: 'assignedInboxThreads',
    agentMessages: 'inboxMessages',
    agentMessageReactions: 'inboxMessageReactions',
  },
} as const satisfies InboxNamesByLegacyName;
