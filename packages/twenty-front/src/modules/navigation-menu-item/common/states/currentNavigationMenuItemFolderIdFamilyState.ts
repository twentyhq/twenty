import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const currentNavigationMenuItemFolderIdFamilyState =
  createAtomFamilyState<string | null, string>({
    key: 'currentNavigationMenuItemFolderIdFamilyState',
    defaultValue: null,
  });
