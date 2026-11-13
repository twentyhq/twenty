import { styled } from '@linaria/react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { InboxTypingIndicator } from '@/ai/components/InboxTypingIndicator';
import { StyledInboxContentContainer } from '@/ai/components/StyledInboxContentContainer';
import { INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING } from '@/ai/constants/InboxThreadPageContentInlinePadding';
import { useHasInboxThreadPageContentInset } from '@/ai/hooks/useHasInboxThreadPageContentInset';
import { inboxTypingWorkspaceMemberIdsFamilyState } from '@/ai/states/inboxTypingWorkspaceMemberIdsFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { inboxHasMessageSelector } from '@/ai/states/selectors/inboxHasMessageSelector';
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
