import { isUndefined } from '@sniptt/guards';

import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { getAgentChatRequestedParticipants } from '@/ai/utils/getAgentChatRequestedParticipants';

export const getAgentChatParticipantAdditionStatus = ({
  initialRecipients,
  participantMentions,
  addedWorkspaceMemberIds,
  writerWorkspaceMemberIds,
}: {
  initialRecipients: AgentChatParticipantMention[];
  participantMentions: AgentChatParticipantMention[];
  addedWorkspaceMemberIds: string[];
  writerWorkspaceMemberIds?: string[] | null;
}) => {
  const addedWorkspaceMemberIdsSet = new Set(addedWorkspaceMemberIds);
  const isParticipantNotAdded = ({
    workspaceMemberId,
  }: AgentChatParticipantMention) =>
    !addedWorkspaceMemberIdsSet.has(workspaceMemberId);
  const hasUnverifiedInitialRecipients =
    isUndefined(writerWorkspaceMemberIds) &&
    initialRecipients.some(isParticipantNotAdded);
  const initialRecipientsToCheck = isUndefined(writerWorkspaceMemberIds)
    ? []
    : initialRecipients.filter(
        ({ workspaceMemberId }) =>
          !writerWorkspaceMemberIds?.includes(workspaceMemberId),
      );
  const notAddedLabels = getAgentChatRequestedParticipants({
    participantMentions,
    initialRecipients: initialRecipientsToCheck,
  })
    .filter(isParticipantNotAdded)
    .map(({ label }) => label)
    .join(', ');

  return { hasUnverifiedInitialRecipients, notAddedLabels };
};
