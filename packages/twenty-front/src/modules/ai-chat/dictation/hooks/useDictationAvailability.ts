import { useMemo } from 'react';

import { hasWebSpeechProvenSilentState } from '@/ai-chat/dictation/states/hasWebSpeechProvenSilentState';
import { readDictationSurface } from '@/ai-chat/dictation/utils/readDictationSurface';
import { resolveDictationAvailability } from '@/ai-chat/dictation/utils/resolveDictationAvailability';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useDictationAvailability = (): boolean => {
  const hasWebSpeechProvenSilent = useAtomStateValue(
    hasWebSpeechProvenSilentState,
  );

  const isSurfaceCapable = useMemo(
    () => resolveDictationAvailability(readDictationSurface()),
    [],
  );

  return isSurfaceCapable && !hasWebSpeechProvenSilent;
};
