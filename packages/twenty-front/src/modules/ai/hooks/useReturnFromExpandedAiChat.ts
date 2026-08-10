import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { shouldContinueAiChatInSidePanelState } from '@/ai/states/shouldContinueAiChatInSidePanelState';
import { getExpandedPageReturnLocation } from '~/utils/getExpandedPageReturnLocation';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';

type UseReturnFromExpandedAiChatParams = {
  reopenSidePanel: boolean;
};

export const useReturnFromExpandedAiChat = ({
  reopenSidePanel,
}: UseReturnFromExpandedAiChatParams) => {
  const store = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const returnLocation = getExpandedPageReturnLocation(location.state);

  return useCallback(() => {
    if (!reopenSidePanel) {
      store.set(shouldContinueAiChatInSidePanelState.atom, false);
      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
      void closeSidePanelMenu();
    }

    navigate(returnLocation ?? defaultHomePagePath);
  }, [
    reopenSidePanel,
    closeSidePanelMenu,
    store,
    navigate,
    returnLocation,
    defaultHomePagePath,
  ]);
};
