import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect, useLayoutEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatIsScrolledToBottomComponentSelector } from '@/ai-chat/messages/states/selectors/aiChatIsScrolledToBottomComponentSelector';
import { pinAiChatScrollToBottom } from '@/ai-chat/messages/utils/pinAiChatScrollToBottom';
import { scrollAiChatToBottom } from '@/ai-chat/messages/utils/scrollAiChatToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { scrollWrapperScrollBottomComponentState } from '@/ui/utilities/scroll/states/scrollWrapperScrollBottomComponentState';
import { getScrollBottomInPx } from '@/ui/utilities/scroll/utils/getScrollBottomInPx';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

export const AiChatMessageListScrollEffect = () => {
  const { threadId } = useAiChatInstanceOrThrow();
  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();
  const setScrollWrapperScrollBottom = useSetAtomComponentState(
    scrollWrapperScrollBottomComponentState,
  );
  const aiChatThreadDisplayedMessages = useAtomFamilyStateValue(
    aiChatThreadDisplayedMessagesFamilyState,
    { threadId },
  );
  const aiChatIsScrolledToBottom = useAtomComponentSelectorValue(
    aiChatIsScrolledToBottomComponentSelector,
  );

  useLayoutEffect(() => {
    const { scrollWrapperElement } = getScrollWrapperElement();

    if (!isDefined(scrollWrapperElement)) {
      return;
    }

    return pinAiChatScrollToBottom({
      scrollWrapperElement,
      onPinningStopped: () =>
        setScrollWrapperScrollBottom(getScrollBottomInPx(scrollWrapperElement)),
    });
  }, [threadId, getScrollWrapperElement, setScrollWrapperScrollBottom]);

  useEffect(() => {
    if (
      !isNonEmptyArray(aiChatThreadDisplayedMessages) ||
      !aiChatIsScrolledToBottom
    ) {
      return;
    }

    const { scrollWrapperElement } = getScrollWrapperElement();

    if (isDefined(scrollWrapperElement)) {
      scrollAiChatToBottom(scrollWrapperElement);
    }
  }, [
    aiChatThreadDisplayedMessages,
    aiChatIsScrolledToBottom,
    getScrollWrapperElement,
  ]);

  return null;
};
