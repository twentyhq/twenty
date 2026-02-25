import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const favoriteFolderSearchFilterComponentState =
  createAtomComponentState<string>({
    key: 'favoriteFolderSearchFilterComponentState',
    defaultValue: '',
    componentInstanceContext: FavoriteFolderPickerInstanceContext,
  });
