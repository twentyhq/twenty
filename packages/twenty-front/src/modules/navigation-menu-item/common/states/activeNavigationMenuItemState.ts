import { type ActiveNavigationMenuItem } from '@/navigation-menu-item/common/types/ActiveNavigationMenuItem';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const activeNavigationMenuItemState =
  createAtomState<ActiveNavigationMenuItem | null>({
    key: 'activeNavigationMenuItemState',
    defaultValue: null,
    useLocalStorage: true,
  });
