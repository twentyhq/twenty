import { useContext } from 'react';

import { AiChatSurfaceContext } from '@/ai-chat/contexts/AiChatSurfaceContext';
import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';
import { getIsWorkspaceSetupChat } from '@/ai-chat/utils/getIsWorkspaceSetupChat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsWorkspaceSetupChat = () => {
  const surface = useContext(AiChatSurfaceContext);
  const isWorkspaceSetupChatActive = useAtomStateValue(
    isWorkspaceSetupChatActiveState,
  );

  return getIsWorkspaceSetupChat({ surface, isWorkspaceSetupChatActive });
};
