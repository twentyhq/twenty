import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const activeDropdownFocusIdState = createAtomState<string | null>({
  key: 'activeDropdownFocusIdState',
  defaultValue: null,
});
