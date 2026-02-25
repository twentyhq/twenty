import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isDragSelectionStartEnabledStateV2 = createAtomState<boolean>({
  key: 'drag-select/isDragSelectionStartEnabledStateV2',
  defaultValue: true,
});
