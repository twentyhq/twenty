import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const favoriteFolderPickerCheckedComponentState = createComponentStateV2<
  string[]
>({
  key: 'favoriteFolderPickerCheckedComponentState',
  defaultValue: [],
  componentInstanceContext: FavoriteFolderPickerInstanceContext,
});
