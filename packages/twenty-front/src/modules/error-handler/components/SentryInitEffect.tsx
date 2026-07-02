import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

type SentryEventStackFrame = {
  filename?: string;
  function?: string;
};

type SentryEventExceptionValue = {
  type?: string;
  value?: string;
  stacktrace?: {
    frames?: SentryEventStackFrame[];
  };
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

const isMultiItemFieldEditorDeleteRangeErrorEvent = (event: SentryEvent) => {
  return getExceptionValues(event).some((exception) => {
    if (
      exception.type !== 'RangeError' ||
      !exception.value?.includes('Position -') ||
      !exception.value.includes('out of range')
    ) {
      return false;
    }

    const stackFrames = exception.stacktrace?.frames ?? [];

    return stackFrames.some(
      (frame) =>
        frame.function === 'convertTextToTag' ||
        frame.filename?.includes('useMultiItemFieldEditor') === true,
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
              if (isMultiItemFieldEditorDeleteRangeErrorEvent(event)) {
                event.fingerprint = [
                  'workflow-send-email',
                  'multi-item-field-editor',
                  'stale-delete-range',
                ];
                event.level = 'warning';
                event.tags = {
                  ...event.tags,
                  feature: 'workflow-send-email',
                  component: 'multi-item-field-editor',
                  cause: 'stale-delete-range',
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
