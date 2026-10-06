import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { dictationEngineState } from '@/ai/dictation/states/dictationEngineState';
import { isDictationRecordingState } from '@/ai/dictation/states/isDictationRecordingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// AiChatDictationEffect owns the engine lifecycle.
export const useDictation = () => {
  const dictationEngine = useAtomStateValue(dictationEngineState);
  const isDictationRecording = useAtomStateValue(isDictationRecordingState);

  const toggleDictation = useCallback(() => {
    if (!isDefined(dictationEngine)) {
      return;
    }

    if (isDictationRecording) {
      dictationEngine.stop();

      return;
    }

    void dictationEngine.start();
  }, [dictationEngine, isDictationRecording]);

  return {
    isAvailable: isDefined(dictationEngine),
    isRecording: isDictationRecording,
    toggleDictation,
  };
};
