import { useStore } from 'jotai';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { getExpandedAiChatReturnLocation } from '@/ai-chat/utils/getExpandedAiChatReturnLocation';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
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
      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);
      void closeSidePanelMenu();
    }

    const destination =
      destinationPath ?? returnLocation ?? defaultHomePagePath;

    if (reopenSidePanel) {
      navigate(destination);
      return;
    }

    navigate(destination, { state: { isAiChatHandoffSkipped: true } });
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
