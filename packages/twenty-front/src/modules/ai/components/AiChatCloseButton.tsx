import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/icon';
import { type ButtonVariant } from 'twenty-ui/primitives/input';
import { IconButton } from 'twenty-ui/components';

import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatCloseButtonProps = {
  variant?: ButtonVariant;
};

export const AiChatCloseButton = ({
  variant = 'outline',
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
      size="sm"
      variant={variant}
      disabled={isWelcomeAnimationVisible}
      onClick={returnFromExpandedAiChat}
      aria-label={t`Close`}
    >
      <IconX />
    </IconButton>
  );
};
