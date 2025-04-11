import { useCallback, useEffect } from 'react';
import { setSessionId, useEventTracker } from '../hooks/useEventTracker';

export const useTrackPageView = () => {
  const eventTracker = useEventTracker();

  const trackPageView = useCallback(() => {
    setSessionId();
    eventTracker('pageview', {
      pathname: window.location.pathname,
      locale: navigator.language,
      userAgent: window.navigator.userAgent,
      href: window.location.href,
      referrer: document.referrer,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, [eventTracker]);

  useEffect(() => {
    const timeoutId = setTimeout(trackPageView, 500);
    return () => clearTimeout(timeoutId);
  }, [trackPageView]);
};
