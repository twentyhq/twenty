import { type AiTaskStateEntry } from '@/ai/types/AiTaskStateEntry';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Keyed by the task id a tool result carries; always the live projection,
// never the snapshot recorded when the task started.
export const aiTaskStateFamilyState = createAtomFamilyState<
  AiTaskStateEntry,
  string
>({
  key: 'ai/aiTaskStateFamilyState',
  defaultValue: { status: 'loading' },
});
