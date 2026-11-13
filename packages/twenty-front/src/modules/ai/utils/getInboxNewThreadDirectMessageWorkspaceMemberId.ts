import { isDefined } from 'twenty-shared/utils';

import { type InboxNewThreadRecipients } from '@/ai/types/InboxNewThreadRecipients';
import { type InboxParticipantMention } from '@/ai/types/InboxParticipantMention';

export const getInboxNewThreadDirectMessageWorkspaceMemberId = ({
  isDirectMessageIdentityEnabled,
  newInboxChatRecipients,
  isAssistantMentioned,
  channelId,
  initialRecipients,
  participantMentions,
}: {
  isDirectMessageIdentityEnabled: boolean;
  newInboxChatRecipients: InboxNewThreadRecipients | undefined;
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  initialRecipients: InboxParticipantMention[];
  participantMentions: InboxParticipantMention[];
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
