import { AI_CHAT_SURFACE } from '@/ai/constants/AiChatSurface';
import { MarkdownLoadingSkeleton } from '@/ai/components/LazyMarkdownRenderer';
import { StyledAiChatContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { AiChatErrorUnderMessageList } from '@/ai/components/AiChatErrorUnderMessageList';
import { AiChatLastMessageWithStreamingState } from '@/ai/components/AiChatLastMessageWithStreamingState';
import { AiChatNonLastMessageIdsList } from '@/ai/components/AiChatNonLastMessageIdsList';
import { AiChatPendingResponseIndicator } from '@/ai/components/AiChatPendingResponseIndicator';
import { AiChatScrollToBottomButton } from '@/ai/components/AiChatScrollToBottomButton';
import { AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect } from '@/ai/components/AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect';
import { AgentChatStreamingAutoScrollEffect } from '@/ai/components/AgentChatStreamingAutoScrollEffect';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { getAiChatScrollWrapperInstanceId } from '@/ai/utils/getAiChatScrollWrapperInstanceId';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { styled } from '@linaria/react';
import { Suspense, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledMessageListContent = styled(StyledAiChatContentContainer)`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]};
`;

export const AiChatTabMessageList = () => {
  const messageListPreamble = useContext(AiChatMessageListPreambleContext);
  const aiChatSurface = useContext(AiChatSurfaceContext);
  const agentChatHasMessage = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  const scrollWrapperInstanceId = getAiChatScrollWrapperInstanceId(
    aiChatSurface ?? AI_CHAT_SURFACE.SIDE_PANEL,
  );

  if (!agentChatHasMessage) {
    if (!isDefined(messageListPreamble)) {
      return null;
    }
    return (
      <StyledPreambleOutsideScrollContainer>
        {messageListPreamble}
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
          <StyledMessageListContent>
            <MarkdownLoadingSkeleton />
          </StyledMessageListContent>
        }
      >
        <StyledScrollWrapperContainer>
          <ScrollWrapper componentInstanceId={scrollWrapperInstanceId}>
            <StyledMessageListContent>
              {messageListPreamble}
              <AiChatNonLastMessageIdsList />
              <AiChatLastMessageWithStreamingState />
              <AiChatPendingResponseIndicator />
              <AiChatErrorUnderMessageList />
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
