import { setSessionId, useEventTracker } from '../hooks/useEventTracker';

export const useTrackPageView = () => {
  const eventTracker = useEventTracker();

  const timeoutId = setTimeout(() => {
    setSessionId();
    eventTracker('pageview', {
      pathname: window.location.pathname,
      locale: navigator.language,
      userAgent: window.navigator.userAgent,
      href: window.location.href,
      referrer: document.referrer,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, 500);

  return () => clearTimeout(timeoutId);
};
