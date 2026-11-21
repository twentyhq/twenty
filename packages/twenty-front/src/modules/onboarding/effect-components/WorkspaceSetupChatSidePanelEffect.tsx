import { useLayoutEffect } from 'react';
import { useStore } from 'jotai';

import { hasOpenedWorkspaceSetupChatSidePanelState } from '@/onboarding/states/hasOpenedWorkspaceSetupChatSidePanelState';
import { aiChatContinueInSidePanelThreadIdState } from '@/ai-chat/states/aiChatContinueInSidePanelThreadIdState';
import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';
import { getCurrentAiChatPageThreadId } from '@/ai-chat/utils/getCurrentAiChatPageThreadId';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { Navigate, useLocation } from 'react-router-dom';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const WorkspaceSetupChatSidePanelEffect = () => {
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );
  const store = useStore();
  const { pathname } = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const newAiChatPageRoute = getAiChatPageRoute({
    isInbox: isAiChatInboxEnabled,
    threadId: null,
  });

  useLayoutEffect(() => {
    if (!shouldOpenAiChatAfterOnboarding) {
      store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, false);
      return;
    }

    if (
      store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom) ||
      isDefined(getCurrentAiChatPageThreadId(store)) ||
      isSettingsPath(pathname) ||
      isDefined(store.get(aiChatContinueInSidePanelThreadIdState.atom))
    ) {
      return;
    }

    store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, true);
    openAskAiPage({ resetNavigationStack: true });
  }, [shouldOpenAiChatAfterOnboarding, store, pathname, openAskAiPage]);

  if (
    shouldOpenAiChatAfterOnboarding &&
    !store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom) &&
    !isDefined(store.get(aiChatContinueInSidePanelThreadIdState.atom)) &&
    isSettingsPath(pathname)
  ) {
    return (
      <Navigate
        to={
          isSettingsPath(defaultHomePagePath)
            ? getAppPath(newAiChatPageRoute.appPath, {
                threadId: newAiChatPageRoute.threadId,
              })
            : defaultHomePagePath
        }
        replace
      />
    );
  }

  return null;
};
