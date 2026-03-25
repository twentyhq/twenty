import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentPageLayoutIdState = createAtomState<string | null>({
  key: 'currentPageLayoutIdState',
  defaultValue: null,
});
