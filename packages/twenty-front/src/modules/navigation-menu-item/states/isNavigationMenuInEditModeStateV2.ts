import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isNavigationMenuInEditModeStateV2 = createAtomState<boolean>({
  key: 'isNavigationMenuInEditModeStateV2',
  defaultValue: false,
});
