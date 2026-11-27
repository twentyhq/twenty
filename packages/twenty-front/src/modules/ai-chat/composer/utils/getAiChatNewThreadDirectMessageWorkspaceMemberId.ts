import { isDefined } from 'twenty-shared/utils';

import { type AiChatNewThreadRecipients } from '@/ai-chat/composer/types/AiChatNewThreadRecipients';
import { type AiChatParticipantMention } from '@/ai-chat/composer/types/AiChatParticipantMention';

export const getAiChatNewThreadDirectMessageWorkspaceMemberId = ({
  isDirectMessageIdentityEnabled,
  newThreadRecipients,
  isAssistantMentioned,
  channelId,
  initialRecipients,
  participantMentions,
}: {
  isDirectMessageIdentityEnabled: boolean;
  newThreadRecipients: AiChatNewThreadRecipients | undefined;
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  initialRecipients: AiChatParticipantMention[];
  participantMentions: AiChatParticipantMention[];
}): string | undefined => {
  if (
    !isDirectMessageIdentityEnabled ||
    !isDefined(newThreadRecipients) ||
    newThreadRecipients.isAssistantParticipant ||
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
