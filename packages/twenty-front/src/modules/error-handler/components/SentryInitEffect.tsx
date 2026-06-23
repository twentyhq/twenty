import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type SentryEventExceptionValue = {
  type?: string;
  value?: string;
};

type SentryEvent = {
  exception?: {
    values?: SentryEventExceptionValue[];
  };
  fingerprint?: string[];
  level?: string;
  tags?: Record<string, string>;
};

const getExceptionValues = (event: SentryEvent) => {
  return event.exception?.values ?? [];
};

const isMultiSelectValueTypeMismatchEvent = (event: SentryEvent) => {
  return getExceptionValues(event).some((exception) => {
    const isFieldValueIncludesError =
      exception.value?.includes('fieldValue.includes is not a function') ??
      false;
    const isValuesIncludesError =
      exception.value?.includes('values.includes is not a function') ?? false;

    return (
      exception.type === 'TypeError' &&
      (isFieldValueIncludesError || isValuesIncludesError)
    );
  });
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
            tracePropagationTargets: [
              'localhost:3001',
              REACT_APP_SERVER_BASE_URL,
            ],
            tracesSampleRate: 1.0,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            beforeSend: (event) => {
              if (isMultiSelectValueTypeMismatchEvent(event)) {
                event.fingerprint = [
                  'object-record',
                  'multi-select',
                  'value-type-mismatch',
                ];
                event.level = 'warning';
                event.tags = {
                  ...event.tags,
                  feature: 'object-record',
                  component: 'multi-select-display',
                  cause: 'value-type-mismatch',
                };
              }

              return event;
            },
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
