import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const LEGACY_AGENT_CHAT_RELATION_FIELD_NAMES_BY_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, { name: string; joinColumnName?: string }>
> = {
  [STANDARD_OBJECTS.attachment.fields.targetAgentChatThread
    .universalIdentifier]: {
    name: 'targetAgentChatThread',
    joinColumnName: 'targetAgentChatThreadId',
  },
  [STANDARD_OBJECTS.person.fields.agentChatThreadTargets.universalIdentifier]: {
    name: 'agentChatThreadTargets',
  },
  [STANDARD_OBJECTS.company.fields.agentChatThreadTargets.universalIdentifier]:
    { name: 'agentChatThreadTargets' },
  [STANDARD_OBJECTS.opportunity.fields.agentChatThreadTargets
    .universalIdentifier]: { name: 'agentChatThreadTargets' },
  [STANDARD_OBJECTS.workspaceMember.fields.agentChatThreads
    .universalIdentifier]: { name: 'agentChatThreads' },
  [STANDARD_OBJECTS.workspaceMember.fields.agentChatThreadParticipants
    .universalIdentifier]: { name: 'agentChatThreadParticipants' },
  [STANDARD_OBJECTS.workspaceMember.fields.assignedAgentChatThreads
    .universalIdentifier]: { name: 'assignedAgentChatThreads' },
  [STANDARD_OBJECTS.workspaceMember.fields.agentMessages.universalIdentifier]: {
    name: 'agentMessages',
  },
  [STANDARD_OBJECTS.workspaceMember.fields.agentMessageReactions
    .universalIdentifier]: { name: 'agentMessageReactions' },
};
