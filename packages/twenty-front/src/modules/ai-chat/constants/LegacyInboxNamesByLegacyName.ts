import { LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME } from 'twenty-shared/ai';

import { type InboxNamesByLegacyName } from '@/ai-chat/types/InboxNamesByLegacyName';

export const LEGACY_INBOX_NAMES_BY_LEGACY_NAME = {
  ...LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
  relationFields: {
    targetAgentChatThread: 'targetAgentChatThread',
    agentChatThreadTargets: 'agentChatThreadTargets',
    agentChatThreads: 'agentChatThreads',
    agentChatThreadParticipants: 'agentChatThreadParticipants',
    assignedAgentChatThreads: 'assignedAgentChatThreads',
    agentMessages: 'agentMessages',
    agentMessageReactions: 'agentMessageReactions',
  },
} as const satisfies InboxNamesByLegacyName;
