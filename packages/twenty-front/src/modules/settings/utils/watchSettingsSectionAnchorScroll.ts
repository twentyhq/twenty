import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

const USER_SCROLL_INTENT_EVENT_NAMES = [
  'pointerdown',
  'wheel',
  'touchstart',
  'keydown',
] as const;

export const watchSettingsSectionAnchorScroll = (
  anchorElement: HTMLElement,
) => {
  const prefersReducedMotion = window.matchMedia(
    doNotTranslate('(prefers-reduced-motion: reduce)'),
  ).matches;

  const scrollToAnchor = () => {
    anchorElement.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  scrollToAnchor();

  const pageElement = anchorElement.parentElement;

  if (!isDefined(pageElement)) {
    return () => undefined;
  }

  // Sections above may still load and push the anchor away until the user scrolls
  const resizeObserver = new ResizeObserver(scrollToAnchor);

  const stopFollowing = () => {
    resizeObserver.disconnect();

    for (const eventName of USER_SCROLL_INTENT_EVENT_NAMES) {
      window.removeEventListener(eventName, stopFollowing);
    }
  };

  resizeObserver.observe(pageElement);

  for (const eventName of USER_SCROLL_INTENT_EVENT_NAMES) {
    window.addEventListener(eventName, stopFollowing, { passive: true });
  }

  return stopFollowing;
};
