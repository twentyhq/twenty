import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconMicrophone } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useDictation } from '@/ai/dictation/hooks/useDictation';
import { type DictationFailureReason } from '@/ai/dictation/types/DictationEngine';
import { getDictationFailureMessage } from '@/ai/dictation/utils/getDictationFailureMessage';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type AiChatDictationButtonProps = {
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
  onSessionEnd: () => void;
};

export const AiChatDictationButton = ({
  onInterimText,
  onFinalText,
  onSessionEnd,
}: AiChatDictationButtonProps) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const handleFailure = useCallback(
    (reason: DictationFailureReason) => {
      enqueueErrorSnackBar({ message: getDictationFailureMessage(reason) });
    },
    [enqueueErrorSnackBar],
  );

  const { isAvailable, isRecording, toggleDictation } = useDictation({
    onInterimText,
    onFinalText,
    onSessionEnd,
    onFailure: handleFailure,
  });

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
