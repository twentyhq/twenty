import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const favoriteFolderPickerComponentFamilyState =
  createAtomComponentFamilyState<FavoriteFolder | undefined, string>({
    key: 'favoriteFolderPickerComponentFamilyState',
    defaultValue: undefined,
    componentInstanceContext: FavoriteFolderPickerInstanceContext,
  });
