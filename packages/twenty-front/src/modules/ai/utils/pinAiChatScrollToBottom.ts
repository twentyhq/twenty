import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_SCROLL_PIN_INTERRUPTING_EVENT_NAMES } from '@/ai/constants/AiChatScrollPinInterruptingEventNames';
import { AI_CHAT_SCROLL_PIN_MAX_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinMaxDurationInMs';
import { AI_CHAT_SCROLL_PIN_MIN_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinMinDurationInMs';
import { AI_CHAT_SCROLL_PIN_QUIET_DURATION_IN_MS } from '@/ai/constants/AiChatScrollPinQuietDurationInMs';
import { scrollAiChatToBottom } from '@/ai/utils/scrollAiChatToBottom';

type PinAiChatScrollToBottomParams = {
  scrollWrapperElement: HTMLElement;
  onContentSettled?: () => void;
  onPinningStopped?: () => void;
};

export const pinAiChatScrollToBottom = ({
  scrollWrapperElement,
  onContentSettled,
  onPinningStopped,
}: PinAiChatScrollToBottomParams) => {
  const startedAtInMs = performance.now();

  let lastScrollHeightInPx = -1;
  let lastClientHeightInPx = -1;
  let lastClientWidthInPx = -1;
  let lastChangeAtInMs = startedAtInMs;
  let animationFrameId: number | undefined;
  let hasSettled = false;
  let hasStopped = false;

  const settle = () => {
    if (hasSettled) {
      return;
    }

    hasSettled = true;
    onContentSettled?.();
  };

  const stop = () => {
    if (hasStopped) {
      return;
    }

    hasStopped = true;

    if (isDefined(animationFrameId)) {
      cancelAnimationFrame(animationFrameId);
    }

    clearTimeout(watchdogTimeoutId);

    AI_CHAT_SCROLL_PIN_INTERRUPTING_EVENT_NAMES.forEach((eventName) =>
      scrollWrapperElement.removeEventListener(eventName, stop),
    );

    settle();
    onPinningStopped?.();
  };

  const pinCurrentFrame = () => {
    scrollAiChatToBottom(scrollWrapperElement);

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
      nowInMs - lastChangeAtInMs >= AI_CHAT_SCROLL_PIN_QUIET_DURATION_IN_MS;

    if (isQuiet) {
      settle();
    }

    if (
      isQuiet &&
      nowInMs - startedAtInMs >= AI_CHAT_SCROLL_PIN_MIN_DURATION_IN_MS
    ) {
      stop();
      return;
    }

    animationFrameId = requestAnimationFrame(pinCurrentFrame);
  };

  const watchdogTimeoutId = setTimeout(
    stop,
    AI_CHAT_SCROLL_PIN_MAX_DURATION_IN_MS,
  );

  AI_CHAT_SCROLL_PIN_INTERRUPTING_EVENT_NAMES.forEach((eventName) =>
    scrollWrapperElement.addEventListener(eventName, stop, { passive: true }),
  );

  pinCurrentFrame();

  return stop;
};
