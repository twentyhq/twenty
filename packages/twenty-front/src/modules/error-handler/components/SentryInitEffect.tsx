import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const SentryInitEffect = () => {
  const sentryConfig = useRecoilValue(sentryConfigState);

  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [isSentryInitialized, setIsSentryInitialized] = useState(false);
  const [isSentryInitializing, setIsSentryInitializing] = useState(false);
  const [isSentryUserDefined, setIsSentryUserDefined] = useState(false);

  useEffect(() => {
    const initializeSentry = async () => {
      if (
        isNonEmptyString(sentryConfig?.dsn) &&
        !isSentryInitialized &&
        !isSentryInitializing
      ) {
        setIsSentryInitializing(true);

        try {
          const {
            init,
            browserTracingIntegration,
            replayIntegration,
            globalHandlersIntegration,
          } = await import('@sentry/react');

          init({
            environment: sentryConfig?.environment ?? undefined,
            release: sentryConfig?.release ?? undefined,
            dsn: sentryConfig?.dsn,
            integrations: [
              browserTracingIntegration({}),
              replayIntegration(),
              globalHandlersIntegration({
                onunhandledrejection: false, // handled in PromiseRejectionEffect
              }),
            ],
            tracePropagationTargets: [
              'localhost:3001',
              REACT_APP_SERVER_BASE_URL,
            ],
            tracesSampleRate: 1.0,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
          });

          setIsSentryInitialized(true);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to initialize Sentry:', error);
        } finally {
          setIsSentryInitializing(false);
        }
      }
    };

    const updateSentryUser = async () => {
      if (
        isSentryInitialized &&
        isDefined(currentUser) &&
        !isSentryUserDefined
      ) {
        try {
          const { setUser } = await import('@sentry/react');
          setUser({
            email: currentUser?.email,
            id: currentUser?.id,
            workspaceId: currentWorkspace?.id,
            workspaceMemberId: currentWorkspaceMember?.id,
          });
          setIsSentryUserDefined(true);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to set Sentry user:', error);
        }
      } else if (!isDefined(currentUser) && isSentryInitialized) {
        try {
          const { setUser } = await import('@sentry/react');
          setUser(null);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to clear Sentry user:', error);
        }
      }
    };

    initializeSentry();
    updateSentryUser();
  }, [
    sentryConfig,
    isSentryInitialized,
    isSentryInitializing,
    currentUser,
    currentWorkspace,
    currentWorkspaceMember,
    isSentryUserDefined,
  ]);

  return <></>;
};
