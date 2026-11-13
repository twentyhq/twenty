import { isUndefined } from '@sniptt/guards';
import uniqBy from 'lodash.uniqby';

import { type InboxParticipantMention } from '@/ai/types/AgentChatParticipantMention';

export const getInboxParticipantAdditionStatus = ({
  initialRecipients,
  participantMentions,
  addedWorkspaceMemberIds,
  writerWorkspaceMemberIds,
}: {
  initialRecipients: InboxParticipantMention[];
  participantMentions: InboxParticipantMention[];
  addedWorkspaceMemberIds: string[];
  writerWorkspaceMemberIds?: string[] | null;
}) => {
  const addedWorkspaceMemberIdsSet = new Set(addedWorkspaceMemberIds);
  const isParticipantNotAdded = ({
    workspaceMemberId,
  }: InboxParticipantMention) =>
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
  const notAddedLabels = uniqBy(
    [...initialRecipientsToCheck, ...participantMentions],
    'workspaceMemberId',
  )
    .filter(isParticipantNotAdded)
    .map(({ label }) => label)
    .join(', ');

  return { hasUnverifiedInitialRecipients, notAddedLabels };
};
