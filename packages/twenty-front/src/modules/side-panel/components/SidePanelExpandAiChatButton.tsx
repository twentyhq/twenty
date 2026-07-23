import { useLingui } from '@lingui/react/macro';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppPath, SidePanelPages } from 'twenty-shared/types';
import { IconLayoutSidebarRightExpand } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { useIsMobile } from 'twenty-ui/utilities';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SidePanelExpandAiChatButton = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const isOnboardingAiChatEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ONBOARDING_AI_CHAT_ENABLED,
  );
  const setAiChatExpandedReturnLocation = useSetAtomState(
    aiChatExpandedReturnLocationState,
  );

  const isOnAskAiPage = sidePanelPage === SidePanelPages.AskAI;

  if (!isOnboardingAiChatEnabled || isMobile || !isOnAskAiPage) {
    return null;
  }

  const handleClick = () => {
    setAiChatExpandedReturnLocation(
      `${location.pathname}${location.search}${location.hash}`,
    );
    navigate(AppPath.WorkspaceSetup);
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
