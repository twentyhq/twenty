import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { AI_CHAT_SURFACE } from '@/ai-chat/constants/AiChatSurface';
import { MarkdownLoadingSkeleton } from '@/ai-chat/message-content/components/LazyMarkdownRenderer';
import { StyledAiChatContentContainer } from '@/ai-chat/components/StyledAiChatContentContainer';
import { AiChatErrorUnderMessageList } from '@/ai-chat/messages/components/AiChatErrorUnderMessageList';
import { AiChatLastMessageWithStreamingState } from '@/ai-chat/messages/components/AiChatLastMessageWithStreamingState';
import { AI_CHAT_MESSAGE_LIST_GAP } from '@/ai-chat/messages/constants/AiChatMessageListGap';
import { AiChatNonLastMessageIdsList } from '@/ai-chat/messages/components/AiChatNonLastMessageIdsList';
import { AiChatPendingResponseIndicator } from '@/ai-chat/messages/components/AiChatPendingResponseIndicator';
import { AiChatScrollToBottomButton } from '@/ai-chat/messages/components/AiChatScrollToBottomButton';
import { AiChatThreadStatusNotice } from '@/ai-chat/threads/components/AiChatThreadStatusNotice';
import { aiChatHasMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatHasMessageFamilySelector';
import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { AI_CHAT_PAGE_CONTENT_INLINE_PADDING } from '@/ai-chat/constants/AiChatPageContentInlinePadding';
import { useHasAiChatPageContentInset } from '@/ai-chat/hooks/useHasAiChatPageContentInset';
import { useIsWorkspaceSetupChat } from '@/ai-chat/hooks/useIsWorkspaceSetupChat';
import { getAiChatScrollWrapperInstanceId } from '@/ai-chat/messages/utils/getAiChatScrollWrapperInstanceId';
import { pinAiChatScrollToBottom } from '@/ai-chat/messages/utils/pinAiChatScrollToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { getScrollBottomInPx } from '@/ui/utilities/scroll/utils/getScrollBottomInPx';
import { watchStickToBottomScroll } from '@/ui/utilities/scroll/utils/watchStickToBottomScroll';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { WorkspaceSetupChatPreamble } from '@/ai-chat/workspace-setup/components/WorkspaceSetupChatPreamble';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { styled } from '@linaria/react';
import { Suspense, useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
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
  gap: ${AI_CHAT_MESSAGE_LIST_GAP};
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
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement(
    scrollWrapperInstanceId,
  );
  const setScrollWrapperScrollBottom = useSetAtomComponentState(
    scrollWrapperScrollBottomComponentState,
    scrollWrapperInstanceId,
  );

  const stickMessageListToBottom = useCallback(
    (messageListContentElement: HTMLDivElement | null) => {
      const { scrollWrapperElement } = getScrollWrapperElement();

      if (
        !isDefined(messageListContentElement) ||
        !isDefined(scrollWrapperElement)
      ) {
        return;
      }

      const stopPinning = pinAiChatScrollToBottom({
        scrollWrapperElement,
        onPinningStopped: () =>
          setScrollWrapperScrollBottom(
            getScrollBottomInPx(scrollWrapperElement),
          ),
      });
      const stopSticking = watchStickToBottomScroll({
        scrollContainerElement: scrollWrapperElement,
        scrollContentElement: messageListContentElement,
      });

      return () => {
        stopPinning();
        stopSticking();
      };
    },
    [getScrollWrapperElement, setScrollWrapperScrollBottom],
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
            <StyledMessageListContent
              key={threadId}
              ref={stickMessageListToBottom}
              hasPageContentInset={hasPageContentInset}
            >
              {isWorkspaceSetupChat && <WorkspaceSetupChatPreamble />}
              <AiChatNonLastMessageIdsList />
              <AiChatLastMessageWithStreamingState />
              <AiChatPendingResponseIndicator />
              <AiChatErrorUnderMessageList />
              <AiChatThreadStatusNotice />
            </StyledMessageListContent>
          </ScrollWrapper>
          <AiChatScrollToBottomButton />
        </StyledScrollWrapperContainer>
      </Suspense>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
