import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const favoriteFolderPickerCheckedComponentState = createComponentState<
  string[]
>({
  key: 'favoriteFolderPickerCheckedComponentState',
  defaultValue: [],
  componentInstanceContext: FavoriteFolderPickerInstanceContext,
});
