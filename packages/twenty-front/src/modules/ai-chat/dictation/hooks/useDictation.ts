import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { dictationEngineComponentState } from '@/ai-chat/dictation/states/dictationEngineComponentState';
import { isDictationRecordingComponentState } from '@/ai-chat/dictation/states/isDictationRecordingComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useDictation = () => {
  const dictationEngine = useAtomComponentStateValue(
    dictationEngineComponentState,
  );
  const isDictationRecording = useAtomComponentStateValue(
    isDictationRecordingComponentState,
  );

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
