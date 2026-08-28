const SCROLL_END_FALLBACK_DEBOUNCE_IN_MS = 150;

// Safari only shipped `scrollend` in 26, and iOS is where this matters most,
// so older engines fall back to debouncing `scroll` until it goes quiet.
export const addScrollEndListener = (
  element: HTMLElement,
  onScrollEnd: () => void,
) => {
  if ('onscrollend' in window) {
    element.addEventListener('scrollend', onScrollEnd);

    return () => element.removeEventListener('scrollend', onScrollEnd);
  }

  let debounceTimeout: ReturnType<typeof setTimeout> | undefined;

  const handleScroll = () => {
    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(
      onScrollEnd,
      SCROLL_END_FALLBACK_DEBOUNCE_IN_MS,
    );
  };

  element.addEventListener('scroll', handleScroll);

  return () => {
    clearTimeout(debounceTimeout);
    element.removeEventListener('scroll', handleScroll);
  };
};
