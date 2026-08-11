import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { getExpandedAiChatReturnLocation } from '@/ai/utils/getExpandedAiChatReturnLocation';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

type UseReturnFromExpandedAiChatParams = {
  reopenSidePanel: boolean;
  destinationPath?: string;
};

export const useReturnFromExpandedAiChat = ({
  reopenSidePanel,
  destinationPath,
}: UseReturnFromExpandedAiChatParams) => {
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const returnLocation = getExpandedAiChatReturnLocation(location.state);

  return useCallback(() => {
    if (!reopenSidePanel) {
      store.set(shouldContinueAiChatInSidePanelState.atom, false);
      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
      void closeSidePanelMenu();
    }

    navigate(destinationPath ?? returnLocation ?? defaultHomePagePath);
  }, [
    reopenSidePanel,
    destinationPath,
    closeSidePanelMenu,
    store,
    navigate,
    returnLocation,
    defaultHomePagePath,
  ]);
};
