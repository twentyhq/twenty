import { useMemo } from 'react';

import { readDictationSurface } from '@/ai/dictation/utils/readDictationSurface';
import {
  resolveDictationAvailability,
  type DictationAvailabilityResult,
} from '@/ai/dictation/utils/resolveDictationAvailability';
import { readWebSpeechSilentFailure } from '@/ai/dictation/utils/webSpeechSilentFailureStorage';

export const useDictationAvailability = (): DictationAvailabilityResult =>
  useMemo(() => {
    const availability = resolveDictationAvailability(readDictationSurface());

    // A browser that already proved its speech engine never emits is treated as
    // unsupported from then on.
    if (availability.status === 'available' && readWebSpeechSilentFailure()) {
      return { status: 'unavailable', reason: 'engine-silent' };
    }

    return availability;
  }, []);
