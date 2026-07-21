import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { aiChatExpandedReturnLocationState } from '@/ai/states/aiChatExpandedReturnLocationState';
import { useDefaultHomePagePath } from '@/navigation/hooks/useDefaultHomePagePath';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatCloseButton = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { defaultHomePagePath } = useDefaultHomePagePath();
  const isWelcomeAnimationVisible = useAtomStateValue(
    isWelcomeAnimationVisibleState,
  );
  const [aiChatExpandedReturnLocation, setAiChatExpandedReturnLocation] =
    useAtomState(aiChatExpandedReturnLocationState);

  const handleClick = () => {
    navigate(aiChatExpandedReturnLocation ?? defaultHomePagePath);
    setAiChatExpandedReturnLocation(null);
  };

  return (
    <IconButton
      Icon={IconX}
      size="small"
      variant="secondary"
      disabled={isWelcomeAnimationVisible}
      onClick={handleClick}
      ariaLabel={t`Close`}
    />
  );
};
