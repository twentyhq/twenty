import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

type ActiveNavigationMenuItem = {
  id: string;
  path: string;
};

export const activeNavigationMenuItemState =
  createAtomState<ActiveNavigationMenuItem | null>({
    key: 'activeNavigationMenuItemState',
    defaultValue: null,
    useLocalStorage: true,
  });
