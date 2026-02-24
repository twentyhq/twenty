import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const favoriteFolderIdsPickerComponentState = createComponentStateV2<
  string[]
>({
  key: 'favoriteFolderIdsPickerComponentState',
  defaultValue: [],
  componentInstanceContext: FavoriteFolderPickerInstanceContext,
});
