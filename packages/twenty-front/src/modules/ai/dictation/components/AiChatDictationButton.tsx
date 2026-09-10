import { t } from '@lingui/core/macro';
import { IconMicrophone } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useDictation } from '@/ai/dictation/hooks/useDictation';

export const AiChatDictationButton = () => {
  const { isAvailable, isRecording, toggleDictation } = useDictation();

  if (!isAvailable) {
    return null;
  }

  const ariaLabel = isRecording ? t`Stop dictation` : t`Start dictation`;

  return (
    <IconButton
      variant="tertiary"
      size="small"
      accent={isRecording ? 'danger' : 'default'}
      onClick={toggleDictation}
      Icon={IconMicrophone}
      ariaLabel={ariaLabel}
    />
  );
};
