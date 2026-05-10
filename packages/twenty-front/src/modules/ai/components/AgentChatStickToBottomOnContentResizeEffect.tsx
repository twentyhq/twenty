import { agentChatIsScrolledToBottomState } from '@/ai/states/agentChatIsScrolledToBottomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type RefObject, useEffect } from 'react';

type AgentChatStickToBottomOnContentResizeEffectProps = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
};

export const AgentChatStickToBottomOnContentResizeEffect = ({
  scrollContainerRef,
  contentRef,
}: AgentChatStickToBottomOnContentResizeEffectProps) => {
  const agentChatIsScrolledToBottom = useAtomStateValue(
    agentChatIsScrolledToBottomState,
  );

  useEffect(() => {
    const content = contentRef.current;
    if (content === null) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (!agentChatIsScrolledToBottom) {
        return;
      }
      const scrollContainer = scrollContainerRef.current;
      if (scrollContainer === null) {
        return;
      }
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    });

    observer.observe(content);
    return () => observer.disconnect();
  }, [agentChatIsScrolledToBottom, scrollContainerRef, contentRef]);

  return null;
};
