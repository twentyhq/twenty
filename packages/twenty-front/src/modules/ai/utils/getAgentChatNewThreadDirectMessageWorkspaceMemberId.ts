import { isDefined } from 'twenty-shared/utils';

export const getAgentChatNewThreadDirectMessageWorkspaceMemberId = ({
  isAssistantParticipant,
  isAssistantMentioned,
  channelId,
  recipientWorkspaceMemberIds,
  mentionedWorkspaceMemberIds,
}: {
  isAssistantParticipant: boolean;
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  recipientWorkspaceMemberIds: string[];
  mentionedWorkspaceMemberIds: string[];
}): string | undefined => {
  if (isAssistantParticipant || isAssistantMentioned || isDefined(channelId)) {
    return undefined;
  }

  const addressedWorkspaceMemberIds = [
    ...new Set([
      ...recipientWorkspaceMemberIds,
      ...mentionedWorkspaceMemberIds,
    ]),
  ];

  return addressedWorkspaceMemberIds.length === 1
    ? addressedWorkspaceMemberIds[0]
    : undefined;
};
