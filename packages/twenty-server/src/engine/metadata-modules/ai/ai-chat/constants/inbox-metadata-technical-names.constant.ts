import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type MetadataTechnicalNamesByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/types/metadata-technical-names-by-universal-identifier.type';

export const INBOX_METADATA_TECHNICAL_NAMES: MetadataTechnicalNamesByUniversalIdentifier =
  {
    objects: {
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
    },
    fields: {
      [STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
        .universalIdentifier]: 'targetInboxThread',
      [STANDARD_OBJECTS.person.fields.agentChatThreadTargets
        .universalIdentifier]: 'inboxThreadTargets',
      [STANDARD_OBJECTS.company.fields.agentChatThreadTargets
        .universalIdentifier]: 'inboxThreadTargets',
      [STANDARD_OBJECTS.opportunity.fields.agentChatThreadTargets
        .universalIdentifier]: 'inboxThreadTargets',
      [STANDARD_OBJECTS.workspaceMember.fields.agentMessages
        .universalIdentifier]: 'inboxMessages',
      [STANDARD_OBJECTS.workspaceMember.fields.agentChatThreads
        .universalIdentifier]: 'inboxThreads',
      [STANDARD_OBJECTS.workspaceMember.fields.agentChatThreadParticipants
        .universalIdentifier]: 'inboxThreadParticipants',
      [STANDARD_OBJECTS.workspaceMember.fields.agentMessageReactions
        .universalIdentifier]: 'inboxMessageReactions',
      [STANDARD_OBJECTS.workspaceMember.fields.assignedAgentChatThreads
        .universalIdentifier]: 'assignedInboxThreads',
    },
  };
