import { useLayoutEffect } from 'react';
import { useStore } from 'jotai';

import { hasOpenedWorkspaceSetupChatSidePanelState } from '@/onboarding/states/hasOpenedWorkspaceSetupChatSidePanelState';
import { useLocation } from 'react-router-dom';

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
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  useLayoutEffect(() => {
    if (!shouldOpenAiChatAfterOnboarding) {
      store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, false);
      return;
    }

    if (
      store.get(hasOpenedWorkspaceSetupChatSidePanelState.atom) ||
      isAiChatPath(pathname) ||
      isSettingsPath(pathname)
    ) {
      return;
    }

    store.set(hasOpenedWorkspaceSetupChatSidePanelState.atom, true);
    openAskAiPage({ resetNavigationStack: true });
  }, [shouldOpenAiChatAfterOnboarding, store, pathname, openAskAiPage]);

  return null;
};
