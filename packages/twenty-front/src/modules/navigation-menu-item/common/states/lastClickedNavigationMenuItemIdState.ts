import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastClickedNavigationMenuItemIdState = createAtomState<
  string | null
>({
  key: 'lastClickedNavigationMenuItemIdState',
  defaultValue: null,
  useSessionStorage: true,
});
