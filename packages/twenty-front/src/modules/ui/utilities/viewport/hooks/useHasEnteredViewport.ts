import { type RefObject, useEffect, useState } from 'react';

const VIEWPORT_PRELOAD_MARGIN = '200px';

// Latches to true the first time the element intersects the viewport
// (clipping ancestors like scroll containers are accounted for) and
// never resets, so consumers can safely mount-once on visibility.
export const useHasEnteredViewport = (
  elementRef: RefObject<HTMLElement | null>,
) => {
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  useEffect(() => {
    if (hasEnteredViewport) {
      return;
    }

    const element = elementRef.current;

    if (element === null) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setHasEnteredViewport(true);

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEnteredViewport(true);
        }
      },
      { rootMargin: VIEWPORT_PRELOAD_MARGIN },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasEnteredViewport, elementRef]);

  return hasEnteredViewport;
};
