import { type DictationEngine } from '@/ai/dictation/types/DictationEngine';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Only set while the surface can dictate; the control renders on its presence.
export const dictationEngineState = createAtomState<DictationEngine | null>({
  key: 'ai/dictationEngine',
  defaultValue: null,
});
