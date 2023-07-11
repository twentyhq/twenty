import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import usePrevious from '@/utils/hooks/usePrevious';

import { useEventTracker } from './useEventTracker';

export function useTrackPageView() {
  const location = useLocation();
  const previousLocation = usePrevious(location);
  const eventTracker = useEventTracker();

  useEffect(() => {
    // Avoid lot of pageview events enven if the location is the same
    if (
      !previousLocation?.pathname ||
      previousLocation?.pathname !== location.pathname
    ) {
      eventTracker('pageview', {
        location: {
          pathname: location.pathname,
        },
      });
    }
  }, [location, eventTracker, previousLocation?.pathname]);
}
