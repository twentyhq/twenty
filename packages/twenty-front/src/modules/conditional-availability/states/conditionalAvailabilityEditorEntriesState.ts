import { type ConditionalAvailabilityEditorEntry } from '@/conditional-availability/types/ConditionalAvailabilityEditorEntry';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const conditionalAvailabilityEditorEntriesState = createAtomState<
  Record<string, ConditionalAvailabilityEditorEntry>
>({
  key: 'conditionalAvailabilityEditorEntriesState',
  defaultValue: {},
});
