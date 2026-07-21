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
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledScrollWrapperContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  width: 100%;
`;

const StyledMessageListContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[4]};
`;

export const AiChatTabMessageList = () => {
  const agentChatHasMessage = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  const agentChatIsInitialScrollPendingOnThreadChange = useAtomStateValue(
    agentChatIsInitialScrollPendingOnThreadChangeState,
  );

  if (!agentChatHasMessage) {
    return null;
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
