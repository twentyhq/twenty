import { isDefined } from 'twenty-shared/utils';

import { type AiChatNewThreadRecipients } from '@/ai/types/AiChatNewThreadRecipients';
import { type AiChatParticipantMention } from '@/ai/types/AiChatParticipantMention';

export const getInboxNewThreadDirectMessageWorkspaceMemberId = ({
  isDirectMessageIdentityEnabled,
  newInboxChatRecipients,
  isAssistantMentioned,
  channelId,
  initialRecipients,
  participantMentions,
}: {
  isDirectMessageIdentityEnabled: boolean;
  newInboxChatRecipients: AiChatNewThreadRecipients | undefined;
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  initialRecipients: AiChatParticipantMention[];
  participantMentions: AiChatParticipantMention[];
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
