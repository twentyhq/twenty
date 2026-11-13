import { useLayoutEffect } from 'react';
import { useStore } from 'jotai';

import { hasOpenedWorkspaceSetupChatSidePanelState } from '@/onboarding/states/hasOpenedWorkspaceSetupChatSidePanelState';
import { shouldContinueInboxInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { Navigate, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isInboxThreadPath } from '~/utils/isAiChatPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

export const WorkspaceSetupChatSidePanelEffect = () => {
  const shouldOpenInboxAfterOnboarding = useAtomStateValue(
    shouldOpenInboxAfterOnboardingState,
  );
  const store = useStore();
  const { pathname } = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  useLayoutEffect(() => {
    if (!shouldOpenInboxAfterOnboarding) {
      store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, false);
      return;
    }

    if (
      store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom) ||
      isInboxThreadPath(pathname) ||
      isSettingsPath(pathname) ||
      store.get(shouldContinueInboxInSidePanelState.atom)
    ) {
      return;
    }

    store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, true);
    openAskAiPage({ resetNavigationStack: true });
  }, [shouldOpenInboxAfterOnboarding, store, pathname, openAskAiPage]);

  if (
    shouldOpenInboxAfterOnboarding &&
    !store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom) &&
    !store.get(shouldContinueInboxInSidePanelState.atom) &&
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
