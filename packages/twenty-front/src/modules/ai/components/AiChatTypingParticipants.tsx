import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatTypingIndicator } from '@/ai/components/AiChatTypingIndicator';
import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { AI_CHAT_PAGE_CONTENT_INLINE_PADDING } from '@/ai/constants/AiChatPageContentInlinePadding';
import { useHasAiChatPageContentInset } from '@/ai/hooks/useHasAiChatPageContentInset';
import { agentChatTypingWorkspaceMemberIdsFamilyState } from '@/ai/states/agentChatTypingWorkspaceMemberIdsFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatHasMessageSelector } from '@/ai/states/selectors/agentChatHasMessageSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledContainer = styled(StyledAiChatContentContainer)<{
  hasPageContentInset: boolean;
}>`
  flex-shrink: 0;
  padding: 0
    ${({ hasPageContentInset }) =>
      hasPageContentInset
        ? AI_CHAT_PAGE_CONTENT_INLINE_PADDING
        : themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
`;

export const AiChatTypingParticipants = () => {
  const hasPageContentInset = useHasAiChatPageContentInset();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const agentChatHasMessage = useAtomStateValue(agentChatHasMessageSelector);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const agentChatTypingWorkspaceMemberIds = useAtomFamilyStateValue(
    agentChatTypingWorkspaceMemberIdsFamilyState,
    { threadId: currentAiChatThread },
  );

  const participants = currentWorkspaceMembers
    .filter(
      ({ id }) =>
        id !== currentWorkspaceMember?.id &&
        agentChatTypingWorkspaceMemberIds.includes(id),
    )
    .map((workspaceMember) => ({
      id: workspaceMember.id,
      name: getWorkspaceMemberNameOrEmail(workspaceMember),
      avatarUrl: getAbsoluteImageUrl(workspaceMember.avatarUrl),
    }));

  if (!agentChatHasMessage || !isNonEmptyArray(participants)) {
    return null;
  }

  return (
    <StyledContainer hasPageContentInset={hasPageContentInset}>
      <AiChatTypingIndicator participants={participants} />
    </StyledContainer>
  );
};
