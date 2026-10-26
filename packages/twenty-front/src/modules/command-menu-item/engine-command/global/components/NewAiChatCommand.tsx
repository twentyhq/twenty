import { useLocation } from 'react-router-dom';

import { useSwitchToNewAiChat } from '@/ai/hooks/useSwitchToNewAiChat';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isAiModePath } from '~/utils/isAiModePath';

export const NewAiChatCommand = () => {
  const { pathname } = useLocation();
  const shouldOpenInFullPage = isAiModePath(pathname);
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
