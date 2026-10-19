import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AGENT_CHAT_ASSISTANT_NAME } from '@/ai/constants/AgentChatAssistantName';
import { useToggleAgentChatMessageReaction } from '@/ai/hooks/useToggleAgentChatMessageReaction';
import { agentChatMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { getAgentChatSenderLabel } from '@/ai/utils/getAgentChatSenderLabel';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledReactions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledReaction = styled.button<{ isSelected: boolean }>`
  align-items: center;
  background: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.accent.tertiary
      : themeCssVariables.background.transparent.lighter};
  border: 1px solid
    ${({ isSelected }) =>
      isSelected
        ? themeCssVariables.border.color.blue
        : themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  padding: 0 ${themeCssVariables.spacing[2]};

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

type AiChatMessageReactionsProps = {
  messageId: string;
};

export const AiChatMessageReactions = ({
  messageId,
}: AiChatMessageReactionsProps) => {
  const { t } = useLingui();
  const agentChatMessageReactions = useAtomFamilyStateValue(
    agentChatMessageReactionsFamilyState,
    { messageId },
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { toggleAgentChatMessageReaction } =
    useToggleAgentChatMessageReaction();

  if (agentChatMessageReactions.length === 0) {
    return null;
  }

  return (
    <StyledReactions>
      {agentChatMessageReactions.map(
        ({ emoji, workspaceMemberIds, agentIds, hasAssistantReacted }) => {
          const reactorNameList = [
            ...workspaceMemberIds.map((workspaceMemberId) =>
              getAgentChatSenderLabel({
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
            ...(hasAssistantReacted ? [AGENT_CHAT_ASSISTANT_NAME] : []),
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
            <StyledReaction
              key={emoji}
              type="button"
              isSelected={isSelected}
              aria-pressed={isSelected}
              title={reactorNames}
              aria-label={t`${emoji} by ${reactorNames}`}
              onClick={() =>
                toggleAgentChatMessageReaction({ messageId, emoji })
              }
            >
              <span aria-hidden>{emoji}</span>
              <span aria-hidden>{reactionCount}</span>
            </StyledReaction>
          );
        },
      )}
    </StyledReactions>
  );
};
