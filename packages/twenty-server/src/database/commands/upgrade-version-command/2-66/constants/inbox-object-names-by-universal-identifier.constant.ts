import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, { nameSingular: string; namePlural: string }>
> = {
  [STANDARD_OBJECTS.agentChatThread.universalIdentifier]: {
    nameSingular: 'inboxThread',
    namePlural: 'inboxThreads',
  },
  [STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier]: {
    nameSingular: 'inboxThreadParticipant',
    namePlural: 'inboxThreadParticipants',
  },
  [STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier]: {
    nameSingular: 'inboxThreadTarget',
    namePlural: 'inboxThreadTargets',
  },
  [STANDARD_OBJECTS.agentMessage.universalIdentifier]: {
    nameSingular: 'inboxMessage',
    namePlural: 'inboxMessages',
  },
  [STANDARD_OBJECTS.agentMessagePart.universalIdentifier]: {
    nameSingular: 'inboxMessagePart',
    namePlural: 'inboxMessageParts',
  },
  [STANDARD_OBJECTS.agentMessageReaction.universalIdentifier]: {
    nameSingular: 'inboxMessageReaction',
    namePlural: 'inboxMessageReactions',
  },
};
