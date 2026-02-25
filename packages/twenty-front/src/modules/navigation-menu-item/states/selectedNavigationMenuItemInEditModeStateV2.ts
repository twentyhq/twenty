import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const selectedNavigationMenuItemInEditModeStateV2 = createAtomState<
  string | null
>({
  key: 'selectedNavigationMenuItemInEditModeStateV2',
  defaultValue: null,
});
