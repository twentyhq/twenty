import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type MetadataTechnicalNamesByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/types/metadata-technical-names-by-universal-identifier.type';

export const LEGACY_INBOX_METADATA_TECHNICAL_NAMES: MetadataTechnicalNamesByUniversalIdentifier =
  {
    objects: {
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
    },
    fields: {
      [STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
        .universalIdentifier]: 'targetAgentChatThread',
      [STANDARD_OBJECTS.person.fields.agentChatThreadTargets
        .universalIdentifier]: 'agentChatThreadTargets',
      [STANDARD_OBJECTS.company.fields.agentChatThreadTargets
        .universalIdentifier]: 'agentChatThreadTargets',
      [STANDARD_OBJECTS.opportunity.fields.agentChatThreadTargets
        .universalIdentifier]: 'agentChatThreadTargets',
      [STANDARD_OBJECTS.workspaceMember.fields.agentMessages
        .universalIdentifier]: 'agentMessages',
      [STANDARD_OBJECTS.workspaceMember.fields.agentChatThreads
        .universalIdentifier]: 'agentChatThreads',
      [STANDARD_OBJECTS.workspaceMember.fields.agentChatThreadParticipants
        .universalIdentifier]: 'agentChatThreadParticipants',
      [STANDARD_OBJECTS.workspaceMember.fields.agentMessageReactions
        .universalIdentifier]: 'agentMessageReactions',
      [STANDARD_OBJECTS.workspaceMember.fields.assignedAgentChatThreads
        .universalIdentifier]: 'assignedAgentChatThreads',
    },
  };
