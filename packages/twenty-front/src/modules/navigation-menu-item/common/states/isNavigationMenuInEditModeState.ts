import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isNavigationMenuInEditModeState = createAtomState<boolean>({
  key: 'isNavigationMenuInEditModeState',
  defaultValue: false,
});
