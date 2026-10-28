import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatIsScrolledToBottomComponentSelector } from '@/ai/states/selectors/agentChatIsScrolledToBottomComponentSelector';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const AgentChatStreamingAutoScrollEffect = () => {
  const agentChatIsScrolledToBottom = useAtomComponentSelectorValue(
    agentChatIsScrolledToBottomComponentSelector,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  useEffect(() => {
    if (!agentChatIsScrolledToBottom) {
      return;
    }

    const { scrollWrapperElement } = getScrollWrapperElement();
    const messageListElement = scrollWrapperElement?.firstElementChild;

    if (!isDefined(scrollWrapperElement) || !isDefined(messageListElement)) {
      return;
    }

    // the answer keeps revealing between message updates, so follow its height instead
    const resizeObserver = new ResizeObserver(() =>
      scrollAiChatToBottom(scrollWrapperElement),
    );

    resizeObserver.observe(messageListElement);

    return () => resizeObserver.disconnect();
  }, [agentChatIsScrolledToBottom, getScrollWrapperElement]);

  return null;
};
