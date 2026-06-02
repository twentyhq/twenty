import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isSelectableListGridFocusedState = createAtomState<boolean>({
  key: 'isSelectableListGridFocusedState',
  defaultValue: false,
});
