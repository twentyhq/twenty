import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { useOpenExpandedAiChat } from '@/ai/expanded-chat/hooks/useOpenExpandedAiChat';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SidePanelExpandAiChatButton = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const { openExpandedAiChat, isOnExpandedAiChatPage } =
    useOpenExpandedAiChat();

  const isOnAskAiPage = sidePanelPage === SidePanelPages.AskAI;

  if (isMobile || !isOnAskAiPage || isOnExpandedAiChatPage) {
    return null;
  }

  return (
    <IconButton
      Icon={IconLayoutSidebarRightExpand}
      size="small"
      variant="tertiary"
      onClick={openExpandedAiChat}
      ariaLabel={t`Expand chat`}
    />
  );
};
