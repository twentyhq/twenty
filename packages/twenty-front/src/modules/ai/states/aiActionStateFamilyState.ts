import { type AiActionStateEntry } from '@/ai/types/AiActionStateEntry';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Keyed by the reference a tool result carries. The server resolves a
// superseded reference to its current revision, so the card keeps its place
// in the conversation while the revision changes.
export const aiActionStateFamilyState = createAtomFamilyState<
  AiActionStateEntry,
  string
>({
  key: 'ai/aiActionStateFamilyState',
  defaultValue: { status: 'loading' },
});
