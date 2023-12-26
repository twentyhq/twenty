import { useEffect, useState } from 'react';
import * as Sentry from '@sentry/react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const SentryInitEffect = () => {
  const sentryConfig = useRecoilValue(sentryConfigState);

  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

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

    if (currentUser) {
      Sentry.setUser({
        email: currentUser?.email,
        id: currentUser?.id,
        workspaceId: currentWorkspace?.id,
        workspaceMemberId: currentWorkspaceMember?.id,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [
    sentryConfig,
    isSentryInitialized,
    currentUser,
    currentWorkspace,
    currentWorkspaceMember,
  ]);
  return <></>;
};
