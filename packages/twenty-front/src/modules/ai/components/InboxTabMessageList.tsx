import { INBOX_SURFACE } from '@/ai/constants/InboxSurface';
import { MarkdownLoadingSkeleton } from '@/ai/components/LazyMarkdownRenderer';
import { StyledInboxContentContainer } from '@/ai/components/StyledInboxContentContainer';
import { AiChatErrorUnderMessageList } from '@/ai/components/AiChatErrorUnderMessageList';
import { InboxLastMessageWithStreamingState } from '@/ai/components/InboxLastMessageWithStreamingState';
import { InboxNonLastMessageIdsList } from '@/ai/components/InboxNonLastMessageIdsList';
import { AiChatPendingResponseIndicator } from '@/ai/components/AiChatPendingResponseIndicator';
import { InboxScrollToBottomButton } from '@/ai/components/InboxScrollToBottomButton';
import { InboxThreadStatusNotice } from '@/ai/components/InboxThreadStatusNotice';
import { InboxScrollToBottomOnDisplayedThreadChangeLayoutEffect } from '@/ai/components/InboxScrollToBottomOnDisplayedThreadChangeLayoutEffect';
import { AgentChatStreamingAutoScrollEffect } from '@/ai/components/AgentChatStreamingAutoScrollEffect';
import { inboxHasMessageSelector } from '@/ai/states/selectors/inboxHasMessageSelector';
import { InboxSurfaceContext } from '@/ai/contexts/InboxSurfaceContext';
import { INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING } from '@/ai/constants/InboxThreadPageContentInlinePadding';
import { useHasInboxThreadPageContentInset } from '@/ai/hooks/useHasInboxThreadPageContentInset';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { getInboxScrollWrapperInstanceId } from '@/ai/utils/getInboxScrollWrapperInstanceId';
import { WorkspaceSetupChatPreamble } from '@/onboarding/components/WorkspaceSetupChatPreamble';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { styled } from '@linaria/react';
import { Suspense, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledScrollWrapperContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  width: 100%;
`;

const StyledPreambleOutsideScrollContainer = styled(
  StyledInboxContentContainer,
)`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledMessageListContent = styled(StyledInboxContentContainer)<{
  hasPageContentInset: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${({ hasPageContentInset }) =>
    hasPageContentInset
      ? `${themeCssVariables.spacing[4]} ${INBOX_THREAD_PAGE_CONTENT_INLINE_PADDING} 0`
      : themeCssVariables.spacing[4]};
`;

export const InboxTabMessageList = () => {
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const inboxSurface = useContext(InboxSurfaceContext);
  const hasPageContentInset = useHasInboxThreadPageContentInset();
  const inboxHasMessage = useAtomStateValue(inboxHasMessageSelector);

  const scrollWrapperInstanceId = getInboxScrollWrapperInstanceId(
    inboxSurface ?? INBOX_SURFACE.SIDE_PANEL,
  );

  if (!inboxHasMessage) {
    if (!isWorkspaceSetupChat) {
      return null;
    }

    return (
      <StyledPreambleOutsideScrollContainer>
        <WorkspaceSetupChatPreamble />
        <AiChatPendingResponseIndicator />
      </StyledPreambleOutsideScrollContainer>
    );
  }

  return (
    <ScrollWrapperComponentInstanceContext.Provider
      value={{ instanceId: scrollWrapperInstanceId }}
    >
      <Suspense
        fallback={
          <StyledScrollWrapperContainer>
            <StyledMessageListContent hasPageContentInset={hasPageContentInset}>
              <MarkdownLoadingSkeleton />
            </StyledMessageListContent>
          </StyledScrollWrapperContainer>
        }
      >
        <StyledScrollWrapperContainer>
          <ScrollWrapper componentInstanceId={scrollWrapperInstanceId}>
            <StyledMessageListContent hasPageContentInset={hasPageContentInset}>
              {isWorkspaceSetupChat && <WorkspaceSetupChatPreamble />}
              <InboxNonLastMessageIdsList />
              <InboxLastMessageWithStreamingState />
              <AiChatPendingResponseIndicator />
              <AiChatErrorUnderMessageList />
              <InboxThreadStatusNotice />
            </StyledMessageListContent>
            <InboxScrollToBottomOnDisplayedThreadChangeLayoutEffect />
            <AgentChatStreamingAutoScrollEffect />
          </ScrollWrapper>
          <InboxScrollToBottomButton />
        </StyledScrollWrapperContainer>
      </Suspense>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
