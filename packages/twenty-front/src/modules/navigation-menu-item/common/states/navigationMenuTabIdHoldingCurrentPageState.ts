import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuTabIdHoldingCurrentPageState = createAtomState<
  string | null
>({
  key: 'navigationMenuTabIdHoldingCurrentPageState',
  defaultValue: null,
});
