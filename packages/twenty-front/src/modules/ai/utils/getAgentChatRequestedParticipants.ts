import { type AgentChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';

export const getAgentChatRequestedParticipants = ({
  participantMentions,
  initialRecipients,
}: {
  participantMentions: AgentChatParticipantMention[];
  initialRecipients: AgentChatParticipantMention[];
}): AgentChatParticipantMention[] => {
  const participantsByWorkspaceMemberId = new Map<
    string,
    AgentChatParticipantMention
  >();

  for (const participant of [...participantMentions, ...initialRecipients]) {
    participantsByWorkspaceMemberId.set(
      participant.workspaceMemberId,
      participant,
    );
  }

  return [...participantsByWorkspaceMemberId.values()];
};
