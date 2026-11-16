import { type AiChatParticipantMention } from '@/ai/types/AiChatParticipantMention';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';

export const filterNewParticipantMentions = ({
  participantMentions,
  thread,
  currentWorkspaceMemberId,
}: {
  participantMentions: AiChatParticipantMention[];
  thread:
    | Pick<AiChatThreadRecord, 'workspaceMemberId' | 'writerWorkspaceMemberIds'>
    | null
    | undefined;
  currentWorkspaceMemberId: string | undefined;
}): AiChatParticipantMention[] => {
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
