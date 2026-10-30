import { type AgentMessageReactionSummary } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const setAgentMessageReaction = ({
  reactions,
  emoji,
  workspaceMemberId,
  isReacted,
}: {
  reactions: AgentMessageReactionSummary[];
  emoji: string;
  workspaceMemberId: string;
  isReacted: boolean;
}): AgentMessageReactionSummary[] => {
  const existingReaction = reactions.find(
    (reaction) => reaction.emoji === emoji,
  );

  if (!isDefined(existingReaction)) {
    return isReacted
      ? [
          ...reactions,
          {
            emoji,
            workspaceMemberIds: [workspaceMemberId],
            agentIds: [],
            hasAssistantReacted: false,
          },
        ]
      : reactions;
  }

  if (
    existingReaction.workspaceMemberIds.includes(workspaceMemberId) ===
    isReacted
  ) {
    return reactions;
  }

  return reactions
    .map((reaction) =>
      reaction.emoji !== emoji
        ? reaction
        : {
            ...reaction,
            workspaceMemberIds: isReacted
              ? [...reaction.workspaceMemberIds, workspaceMemberId]
              : reaction.workspaceMemberIds.filter(
                  (id) => id !== workspaceMemberId,
                ),
          },
    )
    .filter(
      (reaction) =>
        isNonEmptyArray(reaction.workspaceMemberIds) ||
        isNonEmptyArray(reaction.agentIds) ||
        reaction.hasAssistantReacted,
    );
};
