import { type DictationEngine } from '@/ai/dictation/types/DictationEngine';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Only set while a surface can dictate, so its presence is what the control
// reads to decide whether to render at all.
export const dictationEngineState = createAtomState<DictationEngine | null>({
  key: 'ai/dictationEngine',
  defaultValue: null,
});
