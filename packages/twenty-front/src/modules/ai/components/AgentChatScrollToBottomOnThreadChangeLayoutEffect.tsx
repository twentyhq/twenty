import { agentChatIsScrolledToBottomState } from '@/ai/states/agentChatIsScrolledToBottomState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type RefObject, useLayoutEffect } from 'react';

type AgentChatScrollToBottomOnThreadChangeLayoutEffectProps = {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export const AgentChatScrollToBottomOnThreadChangeLayoutEffect = ({
  scrollContainerRef,
}: AgentChatScrollToBottomOnThreadChangeLayoutEffectProps) => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const setAgentChatIsScrolledToBottom = useSetAtomState(
    agentChatIsScrolledToBottomState,
  );

  useLayoutEffect(() => {
    setAgentChatIsScrolledToBottom(true);

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer === null) {
      return;
    }

    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, [currentAiChatThread, scrollContainerRef, setAgentChatIsScrolledToBottom]);

  return null;
};
