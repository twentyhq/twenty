import { useLayoutEffect } from 'react';
import { useStore } from 'jotai';

import { hasOpenedWorkspaceSetupChatSidePanelState } from '@/onboarding/states/hasOpenedWorkspaceSetupChatSidePanelState';
import { aiChatContinueInSidePanelThreadIdState } from '@/ai/states/aiChatContinueInSidePanelThreadIdState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { Navigate, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const WorkspaceSetupChatSidePanelEffect = () => {
  const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
    shouldOpenAiChatAfterOnboardingState,
  );
  const store = useStore();
  const { pathname } = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  useLayoutEffect(() => {
    if (!shouldOpenAiChatAfterOnboarding) {
      store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, false);
      return;
    }

    if (
      store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom) ||
      isAiChatPath(pathname) ||
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
            ? getAppPath(AppPath.AiChat, { threadId: null })
            : defaultHomePagePath
        }
        replace
      />
    );
  }

  return null;
};
