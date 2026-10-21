import { useLocation } from 'react-router-dom';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';
import { isAiChatPath } from '~/utils/isAiChatPath';

export const NewAiChatCommand = () => {
  const { pathname } = useLocation();
  const shouldOpenInFullPage =
    isAiChatPath(pathname) || isAiChatInboxPath(pathname);
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { switchToNewChat } = useSwitchToNewAiChat({
    shouldOpenInFullPage,
  });

  const onExecute = () => {
    switchToNewChat();

    if (shouldOpenInFullPage) {
      void closeSidePanelMenu();
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={onExecute} />;
};
