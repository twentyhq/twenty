import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentNavigationMenuTabIdState = createAtomState<string | null>({
  key: 'currentNavigationMenuTabIdState',
  defaultValue: null,
  useLocalStorage: true,
});
