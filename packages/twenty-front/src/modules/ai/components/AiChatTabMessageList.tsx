import { AiChatErrorUnderMessageList } from '@/ai/components/AiChatErrorUnderMessageList';
import { AiChatLastMessageWithStreamingState } from '@/ai/components/AiChatLastMessageWithStreamingState';
import { AiChatNonLastMessageIdsList } from '@/ai/components/AiChatNonLastMessageIdsList';
import { AiChatPendingResponseIndicator } from '@/ai/components/AiChatPendingResponseIndicator';
import { AiChatScrollToBottomButton } from '@/ai/components/AiChatScrollToBottomButton';
import { AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect } from '@/ai/components/AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect';
import { AgentChatScrollToBottomOnMountLayoutEffect } from '@/ai/components/AgentChatScrollToBottomOnMountLayoutEffect';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { agentChatIsInitialScrollPendingOnThreadChangeState } from '@/ai/states/agentChatIsInitialScrollPendingOnThreadChangeState';
import { AiChatMessageListPreambleContext } from '@/ai/contexts/AiChatMessageListPreambleContext';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
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
  const agentChatHasMessage = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

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
      </StyledPreambleOutsideScrollContainer>
    );
  }

  return (
    <StyledScrollWrapperContainer
      style={{
        visibility: agentChatIsInitialScrollPendingOnThreadChange
          ? 'hidden'
          : 'visible',
      }}
    >
      <ScrollWrapper componentInstanceId={AI_CHAT_SCROLL_WRAPPER_ID}>
        <StyledMessageListContent>
          {messageListPreamble}
          <AiChatNonLastMessageIdsList />
          <AiChatLastMessageWithStreamingState />
          <AiChatPendingResponseIndicator />
          <AiChatErrorUnderMessageList />
        </StyledMessageListContent>
        <AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect />
        <AgentChatScrollToBottomOnMountLayoutEffect />
      </ScrollWrapper>
      <AiChatScrollToBottomButton />
    </StyledScrollWrapperContainer>
  );
};
