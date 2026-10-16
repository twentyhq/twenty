import { type AgentMessageReactionSummary } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

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
      ? [...reactions, { emoji, workspaceMemberIds: [workspaceMemberId] }]
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
            emoji,
            workspaceMemberIds: isReacted
              ? [...reaction.workspaceMemberIds, workspaceMemberId]
              : reaction.workspaceMemberIds.filter(
                  (id) => id !== workspaceMemberId,
                ),
          },
    )
    .filter((reaction) => reaction.workspaceMemberIds.length > 0);
};
