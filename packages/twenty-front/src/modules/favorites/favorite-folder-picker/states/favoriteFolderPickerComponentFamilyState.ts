import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const favoriteFolderPickerComponentFamilyState =
  createComponentFamilyState<FavoriteFolder | undefined, string>({
    key: 'favoriteFolderPickerComponentFamilyState',
    defaultValue: undefined,
    componentInstanceContext: FavoriteFolderPickerInstanceContext,
  });
