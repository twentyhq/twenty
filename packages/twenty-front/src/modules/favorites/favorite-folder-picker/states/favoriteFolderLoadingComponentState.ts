import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const favoriteFolderLoadingComponentState =
  createComponentStateV2<boolean>({
    key: 'favoriteFoldersLoadingComponentState',
    defaultValue: false,
    componentInstanceContext: FavoriteFolderPickerInstanceContext,
  });
