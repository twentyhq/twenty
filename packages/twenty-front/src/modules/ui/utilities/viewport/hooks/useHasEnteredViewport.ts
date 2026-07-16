import { useEffect, useState } from 'react';

const VIEWPORT_PRELOAD_MARGIN = '200px';

// Latches to true the first time the observed element intersects the
// viewport (clipping ancestors like scroll containers are accounted
// for) and never resets, so consumers can safely mount-once on
// visibility. Attach the returned elementRef as the element's ref —
// it is state-backed, so observation starts (or re-arms) whenever the
// element appears, even if it was absent on first render.
export const useHasEnteredViewport = () => {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);

  useEffect(() => {
    if (hasEnteredViewport || element === null) {
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
  }, [hasEnteredViewport, element]);

  return { elementRef: setElement, hasEnteredViewport };
};
