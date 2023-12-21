import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useRecoilValue } from 'recoil';

import { sentryState } from '@/error-handler/states/sentryState';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const ExceptionHandlerProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const sentry = useRecoilValue(sentryState);
  const [isSentryInitialized, setIsSentryInitialized] = useState(false);

  useEffect(() => {
    if (sentry?.dsnKey && !isSentryInitialized) {
      Sentry.init({
        dsn: sentry?.dsnKey,
        integrations: [
          new Sentry.BrowserTracing({
            tracePropagationTargets: [
              'localhost:3001',
              REACT_APP_SERVER_BASE_URL,
            ],
          }),
          new Sentry.Replay(),
        ],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });

      setIsSentryInitialized(true);
    }
  }, [sentry, isSentryInitialized]);

  return <>{children}</>;
};
