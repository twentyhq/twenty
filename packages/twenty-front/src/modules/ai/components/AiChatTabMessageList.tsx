import { AiChatErrorUnderMessageList } from '@/ai/components/AiChatErrorUnderMessageList';
import { AiChatLastMessageWithStreamingState } from '@/ai/components/AiChatLastMessageWithStreamingState';
import { AiChatNonLastMessageIdsList } from '@/ai/components/AiChatNonLastMessageIdsList';
import { AiChatScrollToBottomButton } from '@/ai/components/AiChatScrollToBottomButton';
import { agentChatHasMessageComponentSelector } from '@/ai/states/selectors/agentChatHasMessageComponentSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    setIsAtBottom(true);
    scrollToBottom();
  }, [currentAiChatThread, scrollToBottom]);

  useEffect(() => {
    const content = contentRef.current;
    if (content === null) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (isAtBottom) {
        scrollToBottom();
      }
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, [isAtBottom, scrollToBottom]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollBottom =
      target.scrollHeight - target.clientHeight - target.scrollTop;

    setIsAtBottom(scrollBottom <= SCROLL_BOTTOM_THRESHOLD_PX);
  }, []);

  return (
    <StyledMessageListContainer>
      <StyledScrollContainer ref={containerRef} onScroll={handleScroll}>
        <div ref={contentRef}>
          <AiChatNonLastMessageIdsList />
          <AiChatLastMessageWithStreamingState />
          <AiChatErrorUnderMessageList />
        </div>
      </StyledScrollContainer>
      <AiChatScrollToBottomButton
        isVisible={!isAtBottom}
        onClick={scrollToBottom}
      />
    </StyledMessageListContainer>
  );
};
