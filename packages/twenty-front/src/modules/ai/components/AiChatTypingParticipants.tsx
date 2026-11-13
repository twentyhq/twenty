import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxTypingIndicator } from '@/ai/components/AiChatTypingIndicator';
import { StyledInboxContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING } from '@/ai/constants/AiChatPageContentInlinePadding';
import { useHasInboxThreadPageContentInset } from '@/ai/hooks/useHasAiChatPageContentInset';
import { inboxTypingWorkspaceMemberIdsFamilyState } from '@/ai/states/agentChatTypingWorkspaceMemberIdsFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxHasMessageSelector } from '@/ai/states/selectors/agentChatHasMessageSelector';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledContainer = styled(StyledInboxContentContainer)<{
  hasPageContentInset: boolean;
}>`
  flex-shrink: 0;
  padding: 0
    ${({ hasPageContentInset }) =>
      hasPageContentInset
        ? INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING
        : themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[2]};
`;

export const InboxTypingParticipants = () => {
  const hasPageContentInset = useHasInboxThreadPageContentInset();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const inboxHasMessage = useAtomStateValue(inboxHasMessageSelector);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const inboxTypingWorkspaceMemberIds = useAtomFamilyStateValue(
    inboxTypingWorkspaceMemberIdsFamilyState,
    { threadId: currentInboxThread },
  );

  const participants = currentWorkspaceMembers
    .filter(
      ({ id }) =>
        id !== currentWorkspaceMember?.id &&
        inboxTypingWorkspaceMemberIds.includes(id),
    )
    .map((workspaceMember) => ({
      id: workspaceMember.id,
      name: getWorkspaceMemberNameOrEmail(workspaceMember),
      avatarUrl: getAbsoluteImageUrl(workspaceMember.avatarUrl),
    }));

  if (!inboxHasMessage || !isNonEmptyArray(participants)) {
    return null;
  }

  return (
    <StyledContainer hasPageContentInset={hasPageContentInset}>
      <InboxTypingIndicator participants={participants} />
    </StyledContainer>
  );
};
