import { type RefObject, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export type MediaLoadStatus = 'loading' | 'ready' | 'error';

type UseMediaLoadStatusParams = {
  containerRef: RefObject<HTMLElement | null>;
  isEnabled: boolean;
  resetKey?: string;
};

// The <video> element is created by the viewer library, so its load and error
// handlers cannot be passed as props. They are attached to the container in the
// capture phase instead: media events do not bubble, but they still travel down
// through the ancestors, and the container is mounted before the library
// creates the element, so no event is missed.
export const useMediaLoadStatus = ({
  containerRef,
  isEnabled,
  resetKey,
}: UseMediaLoadStatusParams): MediaLoadStatus => {
  const [status, setStatus] = useState<MediaLoadStatus>('loading');

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const container = containerRef.current;

    if (!isDefined(container)) {
      return;
    }

    setStatus('loading');

    const handleLoaded = () => setStatus('ready');
    const handleError = () => setStatus('error');

    container.addEventListener('loadeddata', handleLoaded, true);
    container.addEventListener('error', handleError, true);

    return () => {
      container.removeEventListener('loadeddata', handleLoaded, true);
      container.removeEventListener('error', handleError, true);
    };
  }, [containerRef, isEnabled, resetKey]);

  return status;
};
