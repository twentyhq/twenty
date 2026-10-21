import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components/input';

import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatCloseButtonProps = {
  destinationPath?: string;
};

export const AiChatCloseButton = ({
  destinationPath,
}: AiChatCloseButtonProps = {}) => {
  const { t } = useLingui();
  const returnFromExpandedAiChat = useReturnFromExpandedAiChat({
    reopenSidePanel: false,
    destinationPath,
  });
  const isWelcomeAnimationVisible = useAtomStateValue(
    isWelcomeAnimationVisibleState,
  );

  return (
    <IconButton
      size="sm"
      variant="outline"
      disabled={isWelcomeAnimationVisible}
      onClick={returnFromExpandedAiChat}
      aria-label={t`Close`}
    >
      <IconX />
    </IconButton>
  );
};
