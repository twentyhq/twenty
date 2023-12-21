import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useRecoilValue } from 'recoil';

import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const SentryInitEffect = () => {
  const sentryConfig = useRecoilValue(sentryConfigState);
  const [isSentryInitialized, setIsSentryInitialized] = useState(false);

  useEffect(() => {
    if (sentryConfig?.dsn && !isSentryInitialized) {
      Sentry.init({
        dsn: sentryConfig?.dsn,
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
  }, [sentryConfig, isSentryInitialized]);
  return <></>;
};
