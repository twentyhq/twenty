import { DICTATION_MODES } from 'twenty-shared/ai';

import { type DictationConfig } from '@/client-config/types/DictationConfig';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// Disabled until the server says otherwise, so the control is never rendered
// against a config that has not loaded.
export const dictationConfigState = createAtomState<DictationConfig>({
  key: 'dictationConfigState',
  defaultValue: { mode: DICTATION_MODES.disabled, maxDurationSeconds: 0 },
});
