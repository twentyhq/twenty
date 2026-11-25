import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuTabIdToOpenFirstItemState = createAtomState<
  string | null
>({
  key: 'navigationMenuTabIdToOpenFirstItemState',
  defaultValue: null,
});
