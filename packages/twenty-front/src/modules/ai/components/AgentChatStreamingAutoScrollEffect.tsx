import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { agentChatIsScrolledToBottomComponentSelector } from '@/ai/states/selectors/agentChatIsScrolledToBottomComponentSelector';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { getScrollBottomInPx } from '@/ui/utilities/scroll/utils/getScrollBottomInPx';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';

export const AgentChatStreamingAutoScrollEffect = () => {
  const agentChatIsScrolledToBottom = useAtomComponentSelectorValue(
    agentChatIsScrolledToBottomComponentSelector,
  );
  const [isPausedByReader, setIsPausedByReader] = useState(false);

  const { getScrollWrapperElement } = useScrollWrapperHTMLElement();

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: () => setIsPausedByReader(false),
  });

  useEffect(() => {
    const { scrollWrapperElement } = getScrollWrapperElement();
    const messageListElement = scrollWrapperElement?.firstElementChild;

    if (!isDefined(scrollWrapperElement) || !isDefined(messageListElement)) {
      return;
    }

    // what the reader opens or clicks must stay where it is, like after scrolling up
    const pauseFollowing = () => setIsPausedByReader(true);
    const resumeFollowingAtBottom = () => {
      if (getScrollBottomInPx(scrollWrapperElement) <= 1) {
        setIsPausedByReader(false);
      }
    };

    messageListElement.addEventListener('pointerdown', pauseFollowing);
    messageListElement.addEventListener('keydown', pauseFollowing);
    scrollWrapperElement.addEventListener('scroll', resumeFollowingAtBottom, {
      passive: true,
    });

    return () => {
      messageListElement.removeEventListener('pointerdown', pauseFollowing);
      messageListElement.removeEventListener('keydown', pauseFollowing);
      scrollWrapperElement.removeEventListener(
        'scroll',
        resumeFollowingAtBottom,
      );
    };
  }, [getScrollWrapperElement]);

  useEffect(() => {
    if (!agentChatIsScrolledToBottom || isPausedByReader) {
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
  }, [agentChatIsScrolledToBottom, isPausedByReader, getScrollWrapperElement]);

  return null;
};
