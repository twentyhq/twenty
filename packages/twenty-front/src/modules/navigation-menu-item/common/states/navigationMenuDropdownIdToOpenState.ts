import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuDropdownIdToOpenState = createAtomState<
  string | null
>({
  key: 'navigationMenuDropdownIdToOpenState',
  defaultValue: null,
});
