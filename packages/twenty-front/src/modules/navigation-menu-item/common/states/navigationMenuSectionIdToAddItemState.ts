import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuSectionIdToAddItemState = createAtomState<
  string | null
>({
  key: 'navigationMenuSectionIdToAddItemState',
  defaultValue: null,
});
