import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const selectedNavigationMenuItemInEditModeState = createAtomState<
  string | null
>({
  key: 'selectedNavigationMenuItemInEditModeState',
  defaultValue: null,
});
