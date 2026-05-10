import { AgentChatScrollToBottomOnThreadChangeLayoutEffect } from '@/ai/components/AgentChatScrollToBottomOnThreadChangeLayoutEffect';
import { AgentChatStickToBottomOnContentResizeEffect } from '@/ai/components/AgentChatStickToBottomOnContentResizeEffect';
import { AiChatErrorUnderMessageList } from '@/ai/components/AiChatErrorUnderMessageList';
import { AiChatLastMessageWithStreamingState } from '@/ai/components/AiChatLastMessageWithStreamingState';
import { AiChatNonLastMessageIdsList } from '@/ai/components/AiChatNonLastMessageIdsList';
import { AiChatScrollToBottomButton } from '@/ai/components/AiChatScrollToBottomButton';
import { agentChatIsScrolledToBottomState } from '@/ai/states/agentChatIsScrolledToBottomState';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { useCallback, useRef } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const SCROLL_BOTTOM_THRESHOLD_PX = 100;

const StyledMessageListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  position: relative;
  width: calc(100% - 24px);
`;

const StyledScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

export const AiChatTabMessageList = () => {
  const agentChatHasMessage = useAtomComponentSelectorValue(
    agentChatHasMessageComponentSelector,
  );

  if (!agentChatHasMessage) {
    return null;
  }

  return <AiChatTabMessageListContent />;
};

const AiChatTabMessageListContent = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const agentChatIsScrolledToBottom = useAtomStateValue(
    agentChatIsScrolledToBottomState,
  );
  const setAgentChatIsScrolledToBottom = useSetAtomState(
    agentChatIsScrolledToBottomState,
  );

  const scrollToBottom = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer === null) {
      return;
    }
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, []);

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const scrollBottom =
        target.scrollHeight - target.clientHeight - target.scrollTop;

      setAgentChatIsScrolledToBottom(
        scrollBottom <= SCROLL_BOTTOM_THRESHOLD_PX,
      );
    },
    [setAgentChatIsScrolledToBottom],
  );

  return (
    <StyledMessageListContainer>
      <AgentChatScrollToBottomOnThreadChangeLayoutEffect
        scrollContainerRef={scrollContainerRef}
      />
      <AgentChatStickToBottomOnContentResizeEffect
        scrollContainerRef={scrollContainerRef}
        contentRef={contentRef}
      />
      <StyledScrollContainer ref={scrollContainerRef} onScroll={handleScroll}>
        <div ref={contentRef}>
          <AiChatNonLastMessageIdsList />
          <AiChatLastMessageWithStreamingState />
          <AiChatErrorUnderMessageList />
        </div>
      </StyledScrollContainer>
      <AiChatScrollToBottomButton
        isVisible={!agentChatIsScrolledToBottom}
        onClick={scrollToBottom}
      />
    </StyledMessageListContainer>
  );
};
