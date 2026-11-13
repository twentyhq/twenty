import { type InboxParticipantMention } from '@/ai/types/InboxParticipantMention';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';

export const filterNewParticipantMentions = ({
  participantMentions,
  thread,
  currentWorkspaceMemberId,
}: {
  participantMentions: InboxParticipantMention[];
  thread:
    | Pick<InboxThreadRecord, 'workspaceMemberId' | 'writerWorkspaceMemberIds'>
    | null
    | undefined;
  currentWorkspaceMemberId: string | undefined;
}): InboxParticipantMention[] => {
  const existingParticipantIds = [
    currentWorkspaceMemberId,
    thread?.workspaceMemberId,
    ...(thread?.writerWorkspaceMemberIds ?? []),
  ];

  return participantMentions.filter(
    ({ workspaceMemberId }) =>
      !existingParticipantIds.includes(workspaceMemberId),
  );
};
