import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { aiChatIsScrolledToBottomComponentSelector } from '@/ai-chat/messages/states/selectors/aiChatIsScrolledToBottomComponentSelector';
import { scrollAiChatToBottom } from '@/ai-chat/messages/utils/scrollAiChatToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AiChatStreamingAutoScrollEffect = () => {
  const { threadId } = useAiChatInstanceOrThrow();

  const aiChatMessages = useAtomFamilyStateValue(aiChatMessagesFamilyState, {
    threadId,
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
