import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useEventTracker } from './useEventTracker';

export function useTrackPageView() {
  const location = useLocation();
  const eventTracker = useEventTracker();

  useEffect(() => {
    eventTracker('pageview', { location });
  }, [location, eventTracker]);
}
