import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const favoriteFolderPickerCheckedComponentState =
  createAtomComponentState<string[]>({
    key: 'favoriteFolderPickerCheckedComponentState',
    defaultValue: [],
    componentInstanceContext: FavoriteFolderPickerInstanceContext,
  });
