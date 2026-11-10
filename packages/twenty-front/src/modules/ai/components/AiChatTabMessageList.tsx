import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { MarkdownLoadingSkeleton } from '@/ai/components/LazyMarkdownRenderer';
import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { AiChatErrorUnderMessageList } from '@/ai/components/AiChatErrorUnderMessageList';
import { AiChatLastMessageWithStreamingState } from '@/ai/components/AiChatLastMessageWithStreamingState';
import { AiChatNonLastMessageIdsList } from '@/ai/components/AiChatNonLastMessageIdsList';
import { AiChatPendingResponseIndicator } from '@/ai/components/AiChatPendingResponseIndicator';
import { AiChatScrollToBottomButton } from '@/ai/components/AiChatScrollToBottomButton';
import { AiChatThreadInboxStateNotice } from '@/ai/components/AiChatThreadInboxStateNotice';
import { AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect } from '@/ai/components/AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect';
import { AgentChatStreamingAutoScrollEffect } from '@/ai/components/AgentChatStreamingAutoScrollEffect';
import { agentChatHasMessageSelector } from '@/ai/states/selectors/agentChatHasMessageSelector';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { AI_CHAT_PAGE_CONTENT_INLINE_PADDING } from '@/ai/constants/AiChatPageContentInlinePadding';
import { useHasAiChatPageContentInset } from '@/ai/hooks/useHasAiChatPageContentInset';
import { useIsWorkspaceSetupChat } from '@/ai/hooks/useIsWorkspaceSetupChat';
import { getAiChatScrollWrapperInstanceId } from '@/ai/utils/getAiChatScrollWrapperInstanceId';
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
  const isWorkspaceSetupChat = useIsWorkspaceSetupChat();
  const aiChatSurface = useContext(AiChatSurfaceContext);
  const hasPageContentInset = useHasAiChatPageContentInset();
  const agentChatHasMessage = useAtomStateValue(agentChatHasMessageSelector);

  const scrollWrapperInstanceId = getAiChatScrollWrapperInstanceId(
    aiChatSurface ?? AI_CHAT_SURFACE.SIDE_PANEL,
  );

  if (!agentChatHasMessage) {
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
              <AiChatThreadInboxStateNotice />
            </StyledMessageListContent>
            <AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect />
            <AgentChatStreamingAutoScrollEffect />
          </ScrollWrapper>
          <AiChatScrollToBottomButton />
        </StyledScrollWrapperContainer>
      </Suspense>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
