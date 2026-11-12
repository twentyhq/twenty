import { isDefined } from 'twenty-shared/utils';

export const getAgentChatNewThreadDirectMessageWorkspaceMemberId = ({
  isAssistantParticipant,
  isAssistantMentioned,
  channelId,
  recipientWorkspaceMemberIds,
  mentionedWorkspaceMemberIds,
  currentWorkspaceMemberId,
}: {
  isAssistantParticipant: boolean;
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  recipientWorkspaceMemberIds: string[];
  mentionedWorkspaceMemberIds: string[];
  currentWorkspaceMemberId: string | undefined;
}): string | undefined => {
  if (isAssistantParticipant || isAssistantMentioned || isDefined(channelId)) {
    return undefined;
  }

  const otherWorkspaceMemberIds = [
    ...new Set([
      ...recipientWorkspaceMemberIds,
      ...mentionedWorkspaceMemberIds,
    ]),
  ].filter(
    (workspaceMemberId) => workspaceMemberId !== currentWorkspaceMemberId,
  );

  return otherWorkspaceMemberIds.length === 1
    ? otherWorkspaceMemberIds[0]
    : undefined;
};
