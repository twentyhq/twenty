import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const previousDropdownFocusIdStackState = createAtomState<string[]>({
  key: 'previousDropdownFocusIdStackState',
  defaultValue: [],
});
