import { type AgentMessageReactionSummary } from 'twenty-shared/ai';

export const toggleAgentMessageReaction = ({
  reactions,
  emoji,
  workspaceMemberId,
}: {
  reactions: AgentMessageReactionSummary[];
  emoji: string;
  workspaceMemberId: string;
}): AgentMessageReactionSummary[] => {
  const existingReaction = reactions.find(
    (reaction) => reaction.emoji === emoji,
  );

  if (!existingReaction) {
    return [...reactions, { emoji, workspaceMemberIds: [workspaceMemberId] }];
  }

  const hasReacted =
    existingReaction.workspaceMemberIds.includes(workspaceMemberId);

  return reactions
    .map((reaction) =>
      reaction.emoji !== emoji
        ? reaction
        : {
            emoji,
            workspaceMemberIds: hasReacted
              ? reaction.workspaceMemberIds.filter(
                  (id) => id !== workspaceMemberId,
                )
              : [...reaction.workspaceMemberIds, workspaceMemberId],
          },
    )
    .filter((reaction) => reaction.workspaceMemberIds.length > 0);
};
