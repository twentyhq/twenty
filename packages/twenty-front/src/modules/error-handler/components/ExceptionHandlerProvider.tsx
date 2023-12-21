import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { sentryState } from '@/error-handler/states/sentryState';
import * as Sentry from "@sentry/react";
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const ExceptionHandlerProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const sentry = useRecoilValue(sentryState);
    const [isSentryInitialized, setIsSentryInitialized] = useState(false);

    useEffect(() => {
        if (sentry?.dsnKey && !isSentryInitialized) {
            /**
             * Initialize Sentry
             */
            Sentry.init({
                dsn: sentry?.dsnKey,
                integrations: [
                new Sentry.BrowserTracing({
                    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
                    tracePropagationTargets: ["localhost:3001", REACT_APP_SERVER_BASE_URL],
                }),
                new Sentry.Replay(),
                ],
                // Performance Monitoring
                tracesSampleRate: 1.0, //  Capture 100% of the transactions
                // Session Replay
                replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
                replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
            });

            setIsSentryInitialized(true);
        }
    }, [sentry]);

    return <>{children}</>;
}