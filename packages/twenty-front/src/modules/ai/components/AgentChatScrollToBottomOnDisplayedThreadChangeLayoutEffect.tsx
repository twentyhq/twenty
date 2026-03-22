import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { agentChatIsInitialScrollPendingOnThreadChangeState } from '@/ai/states/agentChatIsInitialScrollPendingOnThreadChangeState';
import { scrollAIChatToBottom } from '@/ai/utils/scrollAIChatToBottom';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useEffect } from 'react';

const SCROLL_SETTLE_DELAY_MS = 150;

export const AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect =
  () => {
    const agentChatIsInitialScrollPendingOnThreadChange = useAtomStateValue(
      agentChatIsInitialScrollPendingOnThreadChangeState,
    );

    const setAgentChatIsInitialScrollPendingOnThreadChange = useSetAtomState(
      agentChatIsInitialScrollPendingOnThreadChangeState,
    );

    useEffect(() => {
      if (!agentChatIsInitialScrollPendingOnThreadChange) {
        return;
      }

      const scrollWrapperElement = document.getElementById(
        `scroll-wrapper-${AI_CHAT_SCROLL_WRAPPER_ID}`,
      );

      if (!scrollWrapperElement) {
        return;
      }

      let settleTimeoutId: ReturnType<typeof setTimeout> | null = null;

      const scheduleSettle = () => {
        if (settleTimeoutId !== null) {
          clearTimeout(settleTimeoutId);
        }

        scrollAIChatToBottom();

        settleTimeoutId = setTimeout(() => {
          scrollAIChatToBottom();
          setAgentChatIsInitialScrollPendingOnThreadChange(false);
          mutationObserver.disconnect();
        }, SCROLL_SETTLE_DELAY_MS);
      };

      const mutationObserver = new MutationObserver(() => {
        scheduleSettle();
      });

      mutationObserver.observe(scrollWrapperElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      });

      scheduleSettle();

      return () => {
        if (settleTimeoutId !== null) {
          clearTimeout(settleTimeoutId);
        }
        mutationObserver.disconnect();
      };
    }, [
      agentChatIsInitialScrollPendingOnThreadChange,
      setAgentChatIsInitialScrollPendingOnThreadChange,
    ]);

    return null;
  };
