import { isDefined } from 'twenty-shared/utils';

import { type AgentChatNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';
import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';

export const getAgentChatNewThreadDirectMessageWorkspaceMemberId = ({
  isDirectMessageIdentityEnabled,
  newInboxChatRecipients,
  isAssistantMentioned,
  channelId,
  initialRecipients,
  participantMentions,
}: {
  isDirectMessageIdentityEnabled: boolean;
  newInboxChatRecipients: AgentChatNewThreadRecipients | undefined;
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  initialRecipients: AgentChatParticipantMention[];
  participantMentions: AgentChatParticipantMention[];
}): string | undefined => {
  if (
    !isDirectMessageIdentityEnabled ||
    !isDefined(newInboxChatRecipients) ||
    newInboxChatRecipients.isAssistantParticipant ||
    isAssistantMentioned ||
    isDefined(channelId)
  ) {
    return undefined;
  }

  const addressedWorkspaceMemberIds = [
    ...new Set(
      [...initialRecipients, ...participantMentions].map(
        ({ workspaceMemberId }) => workspaceMemberId,
      ),
    ),
  ];

  return addressedWorkspaceMemberIds.length === 1
    ? addressedWorkspaceMemberIds[0]
    : undefined;
};
