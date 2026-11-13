import { type AiChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

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
