import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';

export const filterNewParticipantMentions = ({
  participantMentions,
  thread,
  currentWorkspaceMemberId,
}: {
  participantMentions: AgentChatParticipantMention[];
  thread:
    | Pick<
        AgentChatThreadRecord,
        'workspaceMemberId' | 'writerWorkspaceMemberIds'
      >
    | null
    | undefined;
  currentWorkspaceMemberId: string | undefined;
}): AgentChatParticipantMention[] => {
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
