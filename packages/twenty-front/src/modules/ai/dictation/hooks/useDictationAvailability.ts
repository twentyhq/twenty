import { useMemo } from 'react';

import { DICTATION_MODES } from 'twenty-shared/ai';

import { dictationConfigState } from '@/client-config/states/dictationConfigState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { readDictationSurface } from '@/ai/dictation/utils/readDictationSurface';
import {
  resolveDictationEngineChoice,
  type DictationEngineChoice,
} from '@/ai/dictation/utils/resolveDictationEngineChoice';
import { readWebSpeechSilentFailure } from '@/ai/dictation/utils/webSpeechSilentFailureStorage';

export type DictationAvailability =
  | { status: 'disabled' }
  | DictationEngineChoice;

export const useDictationAvailability = (): {
  availability: DictationAvailability;
  maxDurationSeconds: number;
} => {
  const dictationConfig = useAtomStateValue(dictationConfigState);

  const availability = useMemo<DictationAvailability>(() => {
    if (dictationConfig.mode === DICTATION_MODES.disabled) {
      return { status: 'disabled' };
    }

    const choice = resolveDictationEngineChoice({
      mode: dictationConfig.mode,
      surface: readDictationSurface(),
    });

    // A browser that already proved its speech engine never emits is treated as
    // unsupported from then on.
    if (
      choice.status === 'available' &&
      choice.tier === DICTATION_MODES.local &&
      readWebSpeechSilentFailure()
    ) {
      return { status: 'unavailable', reason: 'engine-silent' };
    }

    return choice;
  }, [dictationConfig.mode]);

  return {
    availability,
    maxDurationSeconds: dictationConfig.maxDurationSeconds,
  };
};
