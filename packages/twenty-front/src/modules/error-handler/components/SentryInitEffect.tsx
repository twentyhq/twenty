import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

const parseOperationNameFromBody = (body: unknown): string | undefined => {
  if (typeof body !== 'string') {
    return undefined;
  }

  try {
    const parsedBody = JSON.parse(body) as { operationName?: unknown };

    return typeof parsedBody.operationName === 'string'
      ? parsedBody.operationName
      : undefined;
  } catch {
    return undefined;
  }
};

export const SentryInitEffect = () => {
  const sentryConfig = useAtomStateValue(sentryConfigState);

  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

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
            beforeBreadcrumb: (breadcrumb, hint) => {
              if (
                breadcrumb.category === 'fetch' &&
                breadcrumb.data?.status_code === 0
              ) {
                return null;
              }

              if (breadcrumb.category === 'fetch') {
                const requestBody =
                  hint?.input && Array.isArray(hint.input)
                    ? hint.input[1]?.body
                    : undefined;

                const operationName = parseOperationNameFromBody(requestBody);

                if (isNonEmptyString(operationName)) {
                  return {
                    ...breadcrumb,
                    data: {
                      ...breadcrumb.data,
                      graphql_operation_name: operationName,
                    },
                  };
                }
              }

              return breadcrumb;
            },
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
          // oxlint-disable-next-line no-console
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
          // oxlint-disable-next-line no-console
          console.error('Failed to set Sentry user:', error);
        }
      } else if (!isDefined(currentUser) && isSentryInitialized) {
        try {
          const { setUser } = await import('@sentry/react');
          setUser(null);
        } catch (error) {
          // oxlint-disable-next-line no-console
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
