import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatMessagesFamilyState } from '@/ai/states/aiChatMessagesFamilyState';
import { aiChatIsScrolledToBottomComponentSelector } from '@/ai/states/selectors/aiChatIsScrolledToBottomComponentSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatStreamingAutoScrollEffect = () => {
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const aiChatMessages = useAtomFamilyStateValue(aiChatMessagesFamilyState, {
    threadId: currentAiChatThread,
  });

  const aiChatIsScrolledToBottom = useAtomComponentSelectorValue(
    aiChatIsScrolledToBottomComponentSelector,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  useEffect(() => {
    if (!isNonEmptyArray(aiChatMessages)) {
      return;
    }

    if (!aiChatIsScrolledToBottom) {
      return;
    }

    const { scrollWrapperElement } = getScrollWrapperElement();

    if (isDefined(scrollWrapperElement)) {
      scrollAiChatToBottom(scrollWrapperElement);
    }
  }, [aiChatMessages, aiChatIsScrolledToBottom, getScrollWrapperElement]);

  return null;
};
