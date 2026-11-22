import { type NavigationMenuDropdownOpenRequest } from '@/navigation-menu-item/common/types/NavigationMenuDropdownOpenRequest';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuDropdownOpenRequestState =
  createAtomState<NavigationMenuDropdownOpenRequest | null>({
    key: 'navigationMenuDropdownOpenRequestState',
    defaultValue: null,
  });
