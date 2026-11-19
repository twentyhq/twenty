import { type ConditionalAvailabilityEditorEntry } from '@/conditional-availability/types/ConditionalAvailabilityEditorEntry';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const conditionalAvailabilityEditorStatesState = createAtomState<
  Record<string, ConditionalAvailabilityEditorEntry>
>({
  key: 'conditionalAvailabilityEditorStatesState',
  defaultValue: {},
});
