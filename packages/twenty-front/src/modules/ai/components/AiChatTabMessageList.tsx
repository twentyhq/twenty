import { AiChatErrorUnderMessageList } from '@/ai/components/AiChatErrorUnderMessageList';
import { AiChatLastMessageWithStreamingState } from '@/ai/components/AiChatLastMessageWithStreamingState';
import { AiChatNonLastMessageIdsList } from '@/ai/components/AiChatNonLastMessageIdsList';
import { AiChatPendingResponseIndicator } from '@/ai/components/AiChatPendingResponseIndicator';
import { AiChatScrollToBottomButton } from '@/ai/components/AiChatScrollToBottomButton';
import { AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect } from '@/ai/components/AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect';
import { AgentChatPinScrollToBottomOnMountLayoutEffect } from '@/ai/components/AgentChatPinScrollToBottomOnMountLayoutEffect';
import { AgentChatStreamingAutoScrollEffect } from '@/ai/components/AgentChatStreamingAutoScrollEffect';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { agentChatIsInitialScrollPendingOnThreadChangeState } from '@/ai/states/agentChatIsInitialScrollPendingOnThreadChangeState';
import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { AiChatSurfaceContext } from '@/ai/contexts/AiChatSurfaceContext';
import { getAiChatScrollWrapperInstanceId } from '@/ai/utils/getAiChatScrollWrapperInstanceId';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { ScrollWrapperComponentInstanceContext } from '@/ui/utilities/scroll/states/contexts/ScrollWrapperComponentInstanceContext';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
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

const StyledPreambleOutsideScrollContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledMessageListContent = styled.div`
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

  const scrollWrapperInstanceId =
    getAiChatScrollWrapperInstanceId(aiChatSurface);

  const agentChatIsInitialScrollPendingOnThreadChange = useAtomStateValue(
    agentChatIsInitialScrollPendingOnThreadChangeState,
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
      <StyledScrollWrapperContainer
        style={{
          visibility: agentChatIsInitialScrollPendingOnThreadChange
            ? 'hidden'
            : 'visible',
        }}
      >
        <ScrollWrapper componentInstanceId={scrollWrapperInstanceId}>
          <StyledMessageListContent>
            {messageListPreamble}
            <AiChatNonLastMessageIdsList />
            <AiChatLastMessageWithStreamingState />
            <AiChatPendingResponseIndicator />
            <AiChatErrorUnderMessageList />
          </StyledMessageListContent>
          <AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect />
          <AgentChatPinScrollToBottomOnMountLayoutEffect />
          <AgentChatStreamingAutoScrollEffect />
        </ScrollWrapper>
        <AiChatScrollToBottomButton />
      </StyledScrollWrapperContainer>
    </ScrollWrapperComponentInstanceContext.Provider>
  );
};
