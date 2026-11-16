import { type RefObject, useEffect } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

const USER_SCROLL_INTENT_EVENTS = [
  'pointerdown',
  'wheel',
  'touchstart',
  'keydown',
] as const;

export const useSettingsSectionAnchorScroll = ({
  anchorRef,
  isTargeted,
  locationKey,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  isTargeted: boolean;
  locationKey: string;
}) => {
  useEffect(() => {
    const anchorElement = anchorRef.current;

    if (!isTargeted || !isDefined(anchorElement)) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      doNotTranslate('(prefers-reduced-motion: reduce)'),
    ).matches;

    const scrollToAnchor = () => {
      anchorElement.scrollIntoView?.({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    };

    scrollToAnchor();

    const pageElement = anchorElement.parentElement;

    if (!isDefined(pageElement)) {
      return;
    }

    // Sections above may still load and push the anchor away until the user scrolls
    const resizeObserver = new ResizeObserver(scrollToAnchor);
    const stopFollowing = () => {
      resizeObserver.disconnect();
      USER_SCROLL_INTENT_EVENTS.forEach((eventName) =>
        window.removeEventListener(eventName, stopFollowing),
      );
    };

    resizeObserver.observe(pageElement);
    USER_SCROLL_INTENT_EVENTS.forEach((eventName) =>
      window.addEventListener(eventName, stopFollowing, { passive: true }),
    );

    return stopFollowing;
  }, [anchorRef, isTargeted, locationKey]);
};
