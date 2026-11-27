import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const { attachment, company, opportunity, person, workspaceMember } =
  STANDARD_OBJECTS;

export const INBOX_RELATION_FIELD_NAME_BY_UNIVERSAL_IDENTIFIER: Partial<
  Record<string, string>
> = {
  [attachment.fields.targetAgentChatThread.universalIdentifier]:
    'targetInboxThread',
  [person.fields.agentChatThreadTargets.universalIdentifier]:
    'inboxThreadTargets',
  [company.fields.agentChatThreadTargets.universalIdentifier]:
    'inboxThreadTargets',
  [opportunity.fields.agentChatThreadTargets.universalIdentifier]:
    'inboxThreadTargets',
  [workspaceMember.fields.agentChatThreads.universalIdentifier]: 'inboxThreads',
  [workspaceMember.fields.agentChatThreadParticipants.universalIdentifier]:
    'inboxThreadParticipants',
  [workspaceMember.fields.assignedAgentChatThreads.universalIdentifier]:
    'assignedInboxThreads',
  [workspaceMember.fields.agentMessages.universalIdentifier]: 'inboxMessages',
  [workspaceMember.fields.agentMessageReactions.universalIdentifier]:
    'inboxMessageReactions',
};
