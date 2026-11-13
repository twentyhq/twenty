import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const SCROLL_SETTLE_DELAY_MS = 150;
const HIGHLIGHT_DURATION_MS = 1500;

const highlightInboxMessage = (messageElement: Element) => {
  messageElement.animate(
    [
      { backgroundColor: themeCssVariables.background.transparent.blue },
      { backgroundColor: 'transparent' },
    ],
    { duration: HIGHLIGHT_DURATION_MS, easing: 'ease-out' },
  );
};

export const scrollToInboxMessage = (messageId: string) => {
  const messageElement = document.querySelector(
    `[data-agent-chat-message-id="${messageId}"]`,
  );

  if (!isDefined(messageElement)) {
    return;
  }

  const prefersReducedMotion =
    isDefined(window.matchMedia) &&
    window.matchMedia(doNotTranslate('(prefers-reduced-motion: reduce)'))
      .matches;

  messageElement.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'center',
  });

  if (prefersReducedMotion) {
    return;
  }

  // smooth scrolling reports no end in every browser, so the flash waits until scroll events stop
  let settleTimeout: ReturnType<typeof setTimeout>;

  const highlightOnceScrollSettles = () => {
    clearTimeout(settleTimeout);
    settleTimeout = setTimeout(() => {
      document.removeEventListener('scroll', highlightOnceScrollSettles, true);
      highlightInboxMessage(messageElement);
    }, SCROLL_SETTLE_DELAY_MS);
  };

  document.addEventListener('scroll', highlightOnceScrollSettles, true);
  highlightOnceScrollSettles();
};
