import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuSectionIdAddingItemState = createAtomState<
  string | null
>({
  key: 'navigationMenuSectionIdAddingItemState',
  defaultValue: null,
});
