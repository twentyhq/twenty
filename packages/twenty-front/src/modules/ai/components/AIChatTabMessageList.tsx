import { AIChatErrorUnderMessageList } from '@/ai/components/AIChatErrorUnderMessageList';
import { AIChatLastMessageWithStreamingState } from '@/ai/components/AIChatLastMessageWithStreamingState';
import { AIChatNonLastMessageIdsList } from '@/ai/components/AIChatNonLastMessageIdsList';
import { AIChatScrollToBottomButton } from '@/ai/components/AIChatScrollToBottomButton';
import { AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect } from '@/ai/components/AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
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
  gap: ${themeCssVariables.spacing[2]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
  position: relative;
  width: calc(100% - 24px);
`;

export const AIChatTabMessageList = () => {
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
        <AIChatNonLastMessageIdsList />
        <AIChatLastMessageWithStreamingState />
        <AIChatErrorUnderMessageList />
        <AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect />
      </ScrollWrapper>
      <AIChatScrollToBottomButton />
    </StyledScrollWrapperContainer>
  );
};
