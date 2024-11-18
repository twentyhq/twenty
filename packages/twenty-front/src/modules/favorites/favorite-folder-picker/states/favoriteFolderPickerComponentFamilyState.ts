import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export const favoriteFolderPickerComponentFamilyState =
  createComponentFamilyStateV2<FavoriteFolder | undefined, string>({
    key: 'favoriteFolderPickerComponentFamilyState',
    defaultValue: undefined,
    componentInstanceContext: FavoriteFolderPickerInstanceContext,
  });
