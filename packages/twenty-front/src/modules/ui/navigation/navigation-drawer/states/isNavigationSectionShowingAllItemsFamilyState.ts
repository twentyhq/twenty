import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const isNavigationSectionShowingAllItemsFamilyState =
  createAtomFamilyState<boolean, string>({
    key: 'isNavigationSectionShowingAllItemsFamilyState',
    defaultValue: false,
    useLocalStorage: true,
  });
