import { isDefined } from 'twenty-shared/utils';

import { INBOX_SCROLL_PIN_INTERRUPTING_EVENT_NAMES } from '@/ai/constants/AiChatScrollPinInterruptingEventNames';
import { INBOX_SCROLL_PIN_MAX_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinMaxDurationInMs';
import { INBOX_SCROLL_PIN_MIN_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinMinDurationInMs';
import { INBOX_SCROLL_PIN_QUIET_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinQuietDurationInMs';
import { scrollInboxToBottom } from '@/ai/utils/scrollAiChatToBottom';

type PinInboxScrollToBottomParams = {
  scrollWrapperElement: Pick<
    HTMLElement,
    | 'scrollHeight'
    | 'clientHeight'
    | 'clientWidth'
    | 'scrollTop'
    | 'addEventListener'
    | 'removeEventListener'
  >;
  onPinningStopped?: () => void;
};

export const pinInboxScrollToBottom = ({
  scrollWrapperElement,
  onPinningStopped,
}: PinInboxScrollToBottomParams) => {
  const startedAtInMs = performance.now();

  let lastScrollHeightInPx = -1;
  let lastClientHeightInPx = -1;
  let lastClientWidthInPx = -1;
  let lastChangeAtInMs = startedAtInMs;
  let animationFrameId: number | undefined;
  let hasStopped = false;

  const stop = () => {
    if (hasStopped) {
      return;
    }

    hasStopped = true;

    if (isDefined(animationFrameId)) {
      cancelAnimationFrame(animationFrameId);
    }

    clearTimeout(watchdogTimeoutId);

    INBOX_SCROLL_PIN_INTERRUPTING_EVENT_NAMES.forEach((eventName) =>
      scrollWrapperElement.removeEventListener(eventName, stop),
    );

    onPinningStopped?.();
  };

  const pinCurrentFrame = () => {
    scrollInboxToBottom(scrollWrapperElement);

    const nowInMs = performance.now();
    const scrollHeightInPx = scrollWrapperElement.scrollHeight;
    const clientHeightInPx = scrollWrapperElement.clientHeight;
    const clientWidthInPx = scrollWrapperElement.clientWidth;

    if (
      scrollHeightInPx !== lastScrollHeightInPx ||
      clientHeightInPx !== lastClientHeightInPx ||
      clientWidthInPx !== lastClientWidthInPx
    ) {
      lastScrollHeightInPx = scrollHeightInPx;
      lastClientHeightInPx = clientHeightInPx;
      lastClientWidthInPx = clientWidthInPx;
      lastChangeAtInMs = nowInMs;
    }

    const isQuiet =
      nowInMs - lastChangeAtInMs >= INBOX_SCROLL_PIN_QUIET_DURATION_IN_MS;

    if (
      isQuiet &&
      nowInMs - startedAtInMs >= INBOX_SCROLL_PIN_MIN_DURATION_IN_MS
    ) {
      stop();
      return;
    }

    animationFrameId = requestAnimationFrame(pinCurrentFrame);
  };

  const watchdogTimeoutId = setTimeout(
    stop,
    INBOX_SCROLL_PIN_MAX_DURATION_IN_MS,
  );

  INBOX_SCROLL_PIN_INTERRUPTING_EVENT_NAMES.forEach((eventName) =>
    scrollWrapperElement.addEventListener(eventName, stop, { passive: true }),
  );

  pinCurrentFrame();

  return stop;
};
