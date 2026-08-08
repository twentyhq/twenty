import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath, SidePanelPages } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const SidePanelExpandAiChatButton = () => {
  const { t } = useLingui();
  const navigateApp = useNavigateApp();
  const location = useLocation();
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { closeSidePanelMenu } = useSidePanelMenu();
  const isAiChatPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_PAGE_ENABLED,
  );

  const isOnAskAiPage = sidePanelPage === SidePanelPages.AskAI;

  if (!isAiChatPageEnabled || isMobile || !isOnAskAiPage) {
    return null;
  }

  const handleClick = () => {
    void closeSidePanelMenu();

    // The chat page's history entry remembers where expansion started, so
    // collapsing returns there even after the entry survives thread
    // switches or a reload.
    navigateApp(
      AppPath.AiChat,
      {
        threadId:
          isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)
            ? currentAiChatThread
            : null,
      },
      undefined,
      {
        state: {
          returnLocation: `${location.pathname}${location.search}${location.hash}`,
        },
      },
    );
  };

  return (
    <IconButton
      Icon={IconLayoutSidebarRightExpand}
      size="small"
      variant="tertiary"
      onClick={handleClick}
      ariaLabel={t`Expand chat`}
    />
  );
};
