import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { ReactionButton } from 'twenty-ui/components/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAiChatAssistantProfile } from '@/ai/hooks/useAiChatAssistantProfile';
import { useToggleAiChatMessageReaction } from '@/ai/hooks/useToggleAiChatMessageReaction';
import { aiChatMessageReactionsFamilyState } from '@/ai/states/aiChatMessageReactionsFamilyState';
import { getAiChatSenderLabel } from '@/ai/utils/getAiChatSenderLabel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledReactions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

type AiChatMessageReactionsProps = {
  messageId: string;
};

export const AiChatMessageReactions = ({
  messageId,
}: AiChatMessageReactionsProps) => {
  const { t } = useLingui();
  const { displayName: assistantName } = useAiChatAssistantProfile();
  const aiChatMessageReactions = useAtomFamilyStateValue(
    aiChatMessageReactionsFamilyState,
    { messageId },
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { toggleAiChatMessageReaction } = useToggleAiChatMessageReaction();

  if (!isNonEmptyArray(aiChatMessageReactions)) {
    return null;
  }

  return (
    <StyledReactions>
      {aiChatMessageReactions.map(
        ({ emoji, workspaceMemberIds, agentIds, hasAssistantReacted }) => {
          const reactorNameList = [
            ...workspaceMemberIds.map((workspaceMemberId) =>
              getAiChatSenderLabel({
                sender: currentWorkspaceMembers.find(
                  ({ id }) => id === workspaceMemberId,
                ),
                isCurrentWorkspaceMember:
                  workspaceMemberId === currentWorkspaceMember?.id,
              }),
            ),
            ...(isNonEmptyArray(agentIds)
              ? [
                  plural(agentIds.length, {
                    one: 'an agent',
                    other: '# agents',
                  }),
                ]
              : []),
            ...(hasAssistantReacted ? [assistantName] : []),
          ];
          const reactorNames = reactorNameList.join(', ');
          const isSelected =
            isDefined(currentWorkspaceMember) &&
            workspaceMemberIds.includes(currentWorkspaceMember.id);
          const reactionCount =
            workspaceMemberIds.length +
            agentIds.length +
            (hasAssistantReacted ? 1 : 0);

          return (
            <ReactionButton
              key={emoji}
              emoji={emoji}
              count={reactionCount}
              pressed={isSelected}
              title={reactorNames}
              aria-label={t`${emoji} by ${reactorNames}`}
              onPressedChange={() =>
                void toggleAiChatMessageReaction({ messageId, emoji })
              }
            />
          );
        },
      )}
    </StyledReactions>
  );
};
