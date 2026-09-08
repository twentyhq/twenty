import { useLayoutEffect, useState } from 'react';
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
  const [hasOpenedSidePanel, setHasOpenedSidePanel] = useState(false);
  const { pathname } = useLocation();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  useLayoutEffect(() => {
    if (!shouldOpenAiChatAfterOnboarding) {
      setHasOpenedSidePanel(false);
      return;
    }

    if (
      hasOpenedSidePanel ||
      isAiChatPath(pathname) ||
      isSettingsPath(pathname)
    ) {
      return;
    }

    setHasOpenedSidePanel(true);
    openAskAiPage({ resetNavigationStack: true });
  }, [
    shouldOpenAiChatAfterOnboarding,
    hasOpenedSidePanel,
    pathname,
    openAskAiPage,
  ]);

  return null;
};
