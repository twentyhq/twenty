import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { AppPath, SidePanelPages } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
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
  const setAiChatExpandedReturnLocation = useSetAtomState(
    aiChatExpandedReturnLocationState,
  );
  const isAiChatPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_PAGE_ENABLED,
  );

  const isOnAskAiPage = sidePanelPage === SidePanelPages.AskAI;

  if (!isAiChatPageEnabled || isMobile || !isOnAskAiPage) {
    return null;
  }

  const handleClick = () => {
    setAiChatExpandedReturnLocation(
      `${location.pathname}${location.search}${location.hash}`,
    );

    void closeSidePanelMenu();

    navigateApp(AppPath.AiChat, {
      threadId:
        isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)
          ? currentAiChatThread
          : null,
    });
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
