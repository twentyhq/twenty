import { useMemo } from 'react';

import { hasWebSpeechProvenSilentState } from '@/ai/dictation/states/hasWebSpeechProvenSilentState';
import { readDictationSurface } from '@/ai/dictation/utils/readDictationSurface';
import { resolveDictationAvailability } from '@/ai/dictation/utils/resolveDictationAvailability';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useDictationAvailability = (): boolean => {
  const hasWebSpeechProvenSilent = useAtomStateValue(
    hasWebSpeechProvenSilentState,
  );

  // Every field the surface reports is fixed for the life of the page; the
  // remembered failure is the only part of availability that moves.
  const isSurfaceCapable = useMemo(
    () => resolveDictationAvailability(readDictationSurface()),
    [],
  );

  return isSurfaceCapable && !hasWebSpeechProvenSilent;
};
