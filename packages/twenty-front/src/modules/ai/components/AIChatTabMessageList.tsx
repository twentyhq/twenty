import { AIChatErrorUnderMessageList } from '@/ai/components/AIChatErrorUnderMessageList';
import { AIChatLastMessageWithStreamingState } from '@/ai/components/AIChatLastMessageWithStreamingState';
import { AIChatNonLastMessageIdsList } from '@/ai/components/AIChatNonLastMessageIdsList';
import { AIChatScrollToBottomButton } from '@/ai/components/AIChatScrollToBottomButton';
import { AIChatScrollToBottomOnMountEffect } from '@/ai/components/AIChatScrollToBottomOnMountEffect';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { agentChatHasMessageComponentSelector } from '@/ai/states/agentChatHasMessageComponentSelector';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
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

  if (!agentChatHasMessage) {
    return null;
  }

  return (
    <StyledScrollWrapperContainer>
      <ScrollWrapper componentInstanceId={AI_CHAT_SCROLL_WRAPPER_ID}>
        <AIChatNonLastMessageIdsList />
        <AIChatLastMessageWithStreamingState />
        <AIChatErrorUnderMessageList />
      </ScrollWrapper>
      <AIChatScrollToBottomButton />
      <AIChatScrollToBottomOnMountEffect />
    </StyledScrollWrapperContainer>
  );
};
