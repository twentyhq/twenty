import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { MarkdownLoadingSkeleton } from '@/ai-chat/message-content/components/LazyMarkdownRenderer';
import { StyledAiChatContentContainer } from '@/ai-chat/components/StyledAiChatContentContainer';
import { AiChatErrorUnderMessageList } from '@/ai-chat/messages/components/AiChatErrorUnderMessageList';
import { AiChatLastMessageWithStreamingState } from '@/ai-chat/messages/components/AiChatLastMessageWithStreamingState';
import { AiChatNonLastMessageIdsList } from '@/ai-chat/messages/components/AiChatNonLastMessageIdsList';
import { AiChatPendingResponseIndicator } from '@/ai-chat/messages/components/AiChatPendingResponseIndicator';
import { AiChatScrollToBottomButton } from '@/ai-chat/messages/components/AiChatScrollToBottomButton';
import { AiChatThreadStatusNotice } from '@/ai-chat/threads/components/AiChatThreadStatusNotice';
import { AiChatScrollToBottomOnDisplayedThreadChangeLayoutEffect } from '@/ai-chat/messages/components/AiChatScrollToBottomOnDisplayedThreadChangeLayoutEffect';
import { AiChatStreamingAutoScrollEffect } from '@/ai-chat/messages/components/AiChatStreamingAutoScrollEffect';
import { aiChatHasMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatHasMessageFamilySelector';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { AI_CHAT_PAGE_CONTENT_INLINE_PADDING } from '@/ai-chat/constants/AiChatPageContentInlinePadding';
import { useHasAiChatPageContentInset } from '@/ai-chat/hooks/useHasAiChatPageContentInset';
import { useIsWorkspaceSetupChat } from '@/ai-chat/hooks/useIsWorkspaceSetupChat';
import { getAiChatScrollWrapperInstanceId } from '@/ai-chat/messages/utils/getAiChatScrollWrapperInstanceId';
import { WorkspaceSetupChatPreamble } from '@/ai-chat/workspace-setup/components/WorkspaceSetupChatPreamble';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { styled } from '@linaria/react';
import { Suspense, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledScrollWrapperContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  width: 100%;
`;

const StyledPreambleOutsideScrollContainer = styled(
  StyledAiChatContentContainer,
)`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledMessageListContent = styled(StyledAiChatContentContainer)<{
  hasPageContentInset: boolean;
}>`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${({ hasPageContentInset }) =>
    hasPageContentInset
      ? `${themeCssVariables.spacing[4]} ${AI_CHAT_PAGE_CONTENT_INLINE_PADDING} 0`
      : themeCssVariables.spacing[4]};
`;

export const AiChatTabMessageList = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const aiChatSurface = useContext(AiChatSurfaceContext);
  const hasPageContentInset = useHasAiChatPageContentInset();
  const aiChatHasMessage = useAtomFamilySelectorValue(
    aiChatHasMessageFamilySelector,
    threadId,
  );

  const scrollWrapperInstanceId = getAiChatScrollWrapperInstanceId(
    aiChatSurface ?? AI_CHAT_SURFACE.SIDE_PANEL,
  );

  if (!aiChatHasMessage) {
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
              <AiChatNonLastMessageIdsList />
              <AiChatLastMessageWithStreamingState />
              <AiChatPendingResponseIndicator />
              <AiChatErrorUnderMessageList />
              <AiChatThreadStatusNotice />
            </StyledMessageListContent>
            <AiChatScrollToBottomOnDisplayedThreadChangeLayoutEffect />
            <AiChatStreamingAutoScrollEffect />
          </ScrollWrapper>
          <AiChatScrollToBottomButton />
        </StyledScrollWrapperContainer>
      </Suspense>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
