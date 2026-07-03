import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import {
  setSessionId,
  useEventTracker,
} from '@/analytics/hooks/useEventTracker';
import { AnalyticsType } from '~/generated-metadata/graphql';
import { getPageTitleFromPath } from '~/utils/title-utils';

export const TrackPageViewEffect = () => {
  const location = useLocation();
  const eventTracker = useEventTracker();

  useEffect(() => {
    setTimeout(() => {
      setSessionId();
      eventTracker(AnalyticsType['PAGEVIEW'], {
        name: getPageTitleFromPath(location.pathname),
        properties: {
          pathname: location.pathname,
          locale: navigator.language,
          userAgent: window.navigator.userAgent,
          href: window.location.href,
          referrer: document.referrer,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    }, 500);
  }, [eventTracker, location.pathname]);

  return null;
};
