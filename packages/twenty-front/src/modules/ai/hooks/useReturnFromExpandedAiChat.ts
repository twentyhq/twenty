import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { shouldContinueInboxInSidePanelState } from '@/ai/states/shouldContinueInboxInSidePanelState';
import { getExpandedInboxReturnLocation } from '@/ai/utils/getExpandedInboxReturnLocation';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';
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

  const returnLocation = getExpandedInboxReturnLocation(location.state);

  return useCallback(() => {
    if (!reopenSidePanel) {
      store.set(shouldContinueInboxInSidePanelState.atom, false);
      store.set(shouldOpenInboxAfterOnboardingState.atom, false);
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
