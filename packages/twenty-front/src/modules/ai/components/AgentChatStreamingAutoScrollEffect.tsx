import { isNonEmptyArray } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { inboxMessagesFamilyState } from '@/ai/states/inboxMessagesFamilyState';
import { inboxIsScrolledToBottomComponentSelector } from '@/ai/states/selectors/inboxIsScrolledToBottomComponentSelector';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { scrollInboxToBottom } from '@/ai/utils/scrollInboxToBottom';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const AgentChatStreamingAutoScrollEffect = () => {
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);

  const inboxMessages = useAtomFamilyStateValue(inboxMessagesFamilyState, {
    threadId: currentInboxThread,
  });

  const inboxIsScrolledToBottom = useAtomComponentSelectorValue(
    inboxIsScrolledToBottomComponentSelector,
  );

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  useEffect(() => {
    if (!isNonEmptyArray(inboxMessages)) {
      return;
    }

    if (!inboxIsScrolledToBottom) {
      return;
    }

    const { scrollWrapperElement } = getScrollWrapperElement();

    if (isDefined(scrollWrapperElement)) {
      scrollInboxToBottom(scrollWrapperElement);
    }
  }, [inboxMessages, inboxIsScrolledToBottom, getScrollWrapperElement]);

  return null;
};
