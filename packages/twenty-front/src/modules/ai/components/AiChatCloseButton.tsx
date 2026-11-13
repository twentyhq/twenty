import { useLingui } from '@lingui/react/macro';
import { IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components/input';

import { useReturnFromExpandedAiChat } from '@/ai/hooks/useReturnFromExpandedAiChat';

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

  return (
    <IconButton
      size="sm"
      variant="outline"
      onClick={returnFromExpandedAiChat}
      aria-label={t`Close`}
    >
      <IconX />
    </IconButton>
  );
};
