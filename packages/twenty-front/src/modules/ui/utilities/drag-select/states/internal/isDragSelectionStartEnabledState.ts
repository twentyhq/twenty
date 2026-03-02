import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isDragSelectionStartEnabledState = createAtomState<boolean>({
  key: 'drag-select/isDragSelectionStartEnabledState',
  defaultValue: true,
});
