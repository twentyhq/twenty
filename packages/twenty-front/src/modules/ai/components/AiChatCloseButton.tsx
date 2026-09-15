import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatCloseButtonProps = {
  variant?: 'primary' | 'secondary';
};

export const AiChatCloseButton = ({
  variant = 'secondary',
}: AiChatCloseButtonProps) => {
  const { t } = useLingui();
  const returnFromExpandedAiChat = useReturnFromExpandedAiChat({
    reopenSidePanel: false,
  });
  const isWelcomeAnimationVisible = useAtomStateValue(
    isWelcomeAnimationVisibleState,
  );

  return (
    <IconButton
      Icon={IconX}
      size="small"
      variant={variant}
      disabled={isWelcomeAnimationVisible}
      onClick={returnFromExpandedAiChat}
      ariaLabel={t`Close`}
    />
  );
};
