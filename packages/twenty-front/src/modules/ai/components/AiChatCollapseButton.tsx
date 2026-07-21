import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { IconLayoutSidebarRightCollapse } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatCollapseButton = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const isWelcomeAnimationVisible = useAtomStateValue(
    isWelcomeAnimationVisibleState,
  );
  const [aiChatExpandedReturnLocation, setAiChatExpandedReturnLocation] =
    useAtomState(aiChatExpandedReturnLocationState);

  const handleClick = () => {
    openAskAiPage({ resetNavigationStack: true });
    navigate(aiChatExpandedReturnLocation ?? defaultHomePagePath);
    setAiChatExpandedReturnLocation(null);
  };

  return (
    <IconButton
      Icon={IconLayoutSidebarRightCollapse}
      size="small"
      variant="tertiary"
      disabled={isWelcomeAnimationVisible}
      onClick={handleClick}
      ariaLabel={t`Collapse to side panel`}
    />
  );
};
