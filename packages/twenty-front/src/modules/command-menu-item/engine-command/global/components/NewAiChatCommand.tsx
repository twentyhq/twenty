import { useLocation } from 'react-router-dom';

import { useSwitchToNewAiChatInInboxChannel } from '@/inbox/hooks/useSwitchToNewAiChatInInboxChannel';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAiModePath } from '~/utils/isAiModePath';

export const NewAiChatCommand = () => {
  const { pathname } = useLocation();
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );
  const shouldOpenInFullPage = isAiModePath(
    pathname,
    inboxRecordRouteObjectNames,
  );
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { switchToNewAiChat } = useSwitchToNewAiChatInInboxChannel({
    shouldOpenInFullPage,
  });

  const onExecute = () => {
    switchToNewAiChat();

    if (shouldOpenInFullPage) {
      void closeSidePanelMenu();
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={onExecute} />;
};
