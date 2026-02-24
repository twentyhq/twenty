import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const favoriteFolderSearchFilterComponentState =
  createComponentStateV2<string>({
    key: 'favoriteFolderSearchFilterComponentState',
    defaultValue: '',
    componentInstanceContext: FavoriteFolderPickerInstanceContext,
  });
