import { useLocation } from 'react-router-dom';

import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiModePath } from '~/utils/isAiModePath';

export const useIsAiChatArtifactSurface = () => {
  const { pathname } = useLocation();
  const isWorkspaceSetupChatActive = useAtomStateValue(
    isWorkspaceSetupChatActiveState,
  );

  return isAiModePath(pathname) && !isWorkspaceSetupChatActive;
};
