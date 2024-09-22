import * as Sentry from '@sentry/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { isDefined } from '~/utils/isDefined';

export const SentryInitEffect = () => {
  const sentryConfig = useRecoilValue(sentryConfigState);

  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [isSentryInitialized, setIsSentryInitialized] = useState(false);

  useEffect(() => {
    if (isNonEmptyString(sentryConfig?.dsn) && !isSentryInitialized) {
      Sentry.init({
        environment: sentryConfig?.environment ?? undefined,
        release: sentryConfig?.release ?? undefined,
        dsn: sentryConfig?.dsn,
        integrations: [
          Sentry.browserTracingIntegration({}),
          Sentry.replayIntegration(),
        ],
        tracePropagationTargets: ['localhost:3001', REACT_APP_SERVER_BASE_URL],
        tracesSampleRate: 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });

      setIsSentryInitialized(true);
    }

    if (isDefined(currentUser)) {
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
