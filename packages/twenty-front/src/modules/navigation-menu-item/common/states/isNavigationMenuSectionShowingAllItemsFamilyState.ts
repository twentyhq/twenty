import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const isNavigationMenuSectionShowingAllItemsFamilyState =
  createAtomFamilyState<boolean, string>({
    key: 'isNavigationMenuSectionShowingAllItemsFamilyState',
    defaultValue: false,
    useLocalStorage: true,
  });
