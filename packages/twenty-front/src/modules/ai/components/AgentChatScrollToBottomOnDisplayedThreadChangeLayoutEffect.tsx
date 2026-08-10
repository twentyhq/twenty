import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatIsInitialScrollPendingOnThreadChangeState } from '@/ai/states/agentChatIsInitialScrollPendingOnThreadChangeState';
import { pinAiChatScrollToBottom } from '@/ai/utils/pinAiChatScrollToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { getScrollBottomInPx } from '@/ui/utilities/scroll/utils/getScrollBottomInPx';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const AgentChatScrollToBottomOnDisplayedThreadChangeLayoutEffect =
  () => {
    const agentChatIsInitialScrollPendingOnThreadChange = useAtomStateValue(
      agentChatIsInitialScrollPendingOnThreadChangeState,
    );

    const setAgentChatIsInitialScrollPendingOnThreadChange = useSetAtomState(
      agentChatIsInitialScrollPendingOnThreadChangeState,
    );

    const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

    const setScrollWrapperScrollBottom = useSetAtomComponentState(
      scrollWrapperScrollBottomComponentState,
    );

    useEffect(() => {
      if (!agentChatIsInitialScrollPendingOnThreadChange) {
        return;
      }

      const { scrollWrapperElement } = getScrollWrapperElement();

      if (!isDefined(scrollWrapperElement)) {
        setAgentChatIsInitialScrollPendingOnThreadChange(false);
        return;
      }

      return pinAiChatScrollToBottom({
        scrollWrapperElement,
        onContentSettled: () =>
          setAgentChatIsInitialScrollPendingOnThreadChange(false),
        onPinningStopped: () =>
          setScrollWrapperScrollBottom(
            getScrollBottomInPx(scrollWrapperElement),
          ),
      });
    }, [
      agentChatIsInitialScrollPendingOnThreadChange,
      setAgentChatIsInitialScrollPendingOnThreadChange,
      getScrollWrapperElement,
      setScrollWrapperScrollBottom,
    ]);

    return null;
  };
