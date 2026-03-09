import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const previousDropdownFocusIdState = createAtomState<string[]>({
  key: 'previousDropdownFocusIdState',
  defaultValue: [],
});
