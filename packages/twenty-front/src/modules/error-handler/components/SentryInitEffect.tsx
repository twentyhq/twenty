import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { sentryConfigState } from '@/client-config/states/sentryConfigState';
import { DEFAULT_SENTRY_TRACES_SAMPLE_RATE } from '@/error-handler/constants/DefaultSentryTracesSampleRate';
import { SENTRY_REPLAY_IGNORE_MUTATIONS_ATTRIBUTE } from '@/error-handler/constants/SentryReplayIgnoreMutationsAttribute';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { isAiContentRecordingAllowed } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';

export const SentryInitEffect = () => {
  const sentryConfig = useAtomStateValue(sentryConfigState);

  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);

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
          const { init, browserTracingIntegration, globalHandlersIntegration } =
            await import('@sentry/react');

          init({
            environment: sentryConfig?.environment ?? undefined,
            release: sentryConfig?.release ?? undefined,
            dsn: sentryConfig?.dsn,
            // Firefox for iOS can throw from its injected YouTube quality script.
            ignoreErrors: [
              /^(?:TypeError: )?undefined is not an object \(evaluating 'window\.__firefox__\.refresh_youtube_quality_[A-Fa-f0-9]{32}'\)$/,
            ],
            integrations: [
              browserTracingIntegration({}),
              globalHandlersIntegration({
                onunhandledrejection: false, // handled in PromiseRejectionEffect
              }),
            ],
            tracePropagationTargets: [
              'localhost:3001',
              REACT_APP_SERVER_BASE_URL,
            ],
            tracesSampleRate:
              sentryConfig?.tracesSampleRate ??
              DEFAULT_SENTRY_TRACES_SAMPLE_RATE,
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

    const syncSessionReplayWithSharing = async () => {
      if (
        !isSentryInitialized ||
        !isCurrentUserLoaded ||
        !isDefined(currentWorkspace)
      ) {
        return;
      }

      const { addIntegration, getReplay, replayIntegration } =
        await import('@sentry/react');

      if (
        !isAiContentRecordingAllowed(getWorkspaceAiDataPolicy(currentWorkspace))
      ) {
        await getReplay()?.stop();

        return;
      }

      const replay = getReplay();

      if (!isDefined(replay)) {
        addIntegration(
          replayIntegration({
            _experiments: {
              ignoreMutations: [
                `[${SENTRY_REPLAY_IGNORE_MUTATIONS_ATTRIBUTE}]`,
              ],
            },
          }),
        );

        return;
      }

      if (!isDefined(replay.getReplayId())) {
        replay.startBuffering();
      }
    };

    initializeSentry();
    updateSentryUser();
    syncSessionReplayWithSharing();
  }, [
    sentryConfig,
    isSentryInitialized,
    isSentryInitializing,
    currentUser,
    currentWorkspace,
    currentWorkspaceMember,
    isSentryUserDefined,
    isCurrentUserLoaded,
  ]);

  return <></>;
};
