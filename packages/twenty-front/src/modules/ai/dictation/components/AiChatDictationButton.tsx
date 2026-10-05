import { t } from '@lingui/core/macro';
import { IconMicrophone } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/components';

import { useDictation } from '@/ai/dictation/hooks/useDictation';

export const AiChatDictationButton = () => {
  const { isAvailable, isRecording, toggleDictation } = useDictation();

  if (!isAvailable) {
    return null;
  }

  const ariaLabel = isRecording ? t`Stop dictation` : t`Start dictation`;

  return (
    <IconButton
      variant="ghost"
      size="sm"
      color={isRecording ? 'danger' : 'neutral'}
      onClick={toggleDictation}
      aria-label={ariaLabel}
    >
      <IconMicrophone />
    </IconButton>
  );
};
