import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const selectedNavigationMenuItemIdInEditModeState = createAtomState<
  string | null
>({
  key: 'selectedNavigationMenuItemIdInEditModeState',
  defaultValue: null,
});
