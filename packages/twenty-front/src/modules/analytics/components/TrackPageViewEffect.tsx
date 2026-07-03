import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  setSessionId,
  useEventTracker,
} from '@/analytics/hooks/useEventTracker';
import { AnalyticsType } from '~/generated-metadata/graphql';
import { getPageTitleFromPath } from '~/utils/title-utils';

const PAGEVIEW_TRACKING_DELAY_IN_MS = 500;

const stripQueryAndHash = (url: string): string => {
  try {
    const { origin, pathname } = new URL(url);
    return `${origin}${pathname}`;
  } catch {
    return '';
  }
};

export const TrackPageViewEffect = () => {
  const location = useLocation();
  const eventTracker = useEventTracker();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSessionId();
      eventTracker(AnalyticsType['PAGEVIEW'], {
        name: getPageTitleFromPath(location.pathname),
        properties: {
          pathname: location.pathname,
          locale: navigator.language,
          userAgent: window.navigator.userAgent,
          href: stripQueryAndHash(window.location.href),
          referrer: stripQueryAndHash(document.referrer),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    }, PAGEVIEW_TRACKING_DELAY_IN_MS);

    return () => clearTimeout(timeoutId);
  }, [eventTracker, location.pathname]);

  return null;
};
