import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
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
    const agentChatDisplayedThread = useAtomStateValue(
      agentChatDisplayedThreadState,
    );

    const setAgentChatIsInitialScrollPendingOnThreadChange = useSetAtomState(
      agentChatIsInitialScrollPendingOnThreadChangeState,
    );

    const store = useStore();

    const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

    const setScrollWrapperScrollBottom = useSetAtomComponentState(
      scrollWrapperScrollBottomComponentState,
    );

    useEffect(() => {
      if (!store.get(agentChatIsInitialScrollPendingOnThreadChangeState.atom)) {
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
      agentChatDisplayedThread,
      store,
      setAgentChatIsInitialScrollPendingOnThreadChange,
      getScrollWrapperElement,
      setScrollWrapperScrollBottom,
    ]);

    return null;
  };
