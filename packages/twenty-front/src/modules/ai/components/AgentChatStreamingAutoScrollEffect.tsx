import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { agentChatIsScrolledToBottomComponentSelector } from '@/ai/states/selectors/agentChatIsScrolledToBottomComponentSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AgentChatStreamingAutoScrollEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const agentChatMessages = useAtomFamilyStateValue(
    agentChatMessagesFamilyState,
    { threadId: currentAiChatThread },
  );

  const agentChatIsScrolledToBottom = useAtomComponentSelectorValue(
    agentChatIsScrolledToBottomComponentSelector,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  useEffect(() => {
    if (!isNonEmptyArray(agentChatMessages)) {
      return;
    }

    if (!agentChatIsScrolledToBottom) {
      return;
    }

    const { scrollWrapperElement } = getScrollWrapperElement();

    if (isDefined(scrollWrapperElement)) {
      scrollAiChatToBottom(scrollWrapperElement);
    }
  }, [agentChatMessages, agentChatIsScrolledToBottom, getScrollWrapperElement]);

  return null;
};
