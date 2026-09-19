import { AppPath } from 'twenty-shared/types';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useNavigateToAiChatChannelPage = () => {
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const navigateToAiChatChannelPage = (channelId: string) => {
    void closeSidePanelMenu();

    navigate(AppPath.AiChatChannel, { channelId, threadId: null });
  };

  return { navigateToAiChatChannelPage };
};
