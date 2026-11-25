import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const LEGACY_AGENT_CHAT_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, { nameSingular: string; namePlural: string }>
> = {
  [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
    nameSingular: 'agentChatThread',
    namePlural: 'agentChatThreads',
  },
  [STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier]: {
    nameSingular: 'agentChatThreadParticipant',
    namePlural: 'agentChatThreadParticipants',
  },
  [STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier]: {
    nameSingular: 'agentChatThreadTarget',
    namePlural: 'agentChatThreadTargets',
  },
  [STANDARD_OBJECTS.agentMessage.universalIdentifier]: {
    nameSingular: 'agentMessage',
    namePlural: 'agentMessages',
  },
  [STANDARD_OBJECTS.agentMessagePart.universalIdentifier]: {
    nameSingular: 'agentMessagePart',
    namePlural: 'agentMessageParts',
  },
  [STANDARD_OBJECTS.agentMessageReaction.universalIdentifier]: {
    nameSingular: 'agentMessageReaction',
    namePlural: 'agentMessageReactions',
  },
};
