import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { favoriteFolderIdsPickerComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderIdPickerComponentState';
import { favoriteFolderPickerComponentFamilyState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerComponentFamilyState';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';
import { isDefined } from 'twenty-shared/utils';

export const favoriteFoldersComponentSelector = createComponentSelectorV2<
  FavoriteFolder[]
>({
  key: 'favoriteFoldersComponentSelector',
  componentInstanceContext: FavoriteFolderPickerInstanceContext,
  get:
    (componentStateKey) =>
    ({ get }) => {
      const folderIds = get(
        favoriteFolderIdsPickerComponentState,
        componentStateKey,
      ) as string[];

      return folderIds
        .map((folderId: string) =>
          get(favoriteFolderPickerComponentFamilyState, {
            instanceId: componentStateKey.instanceId,
            familyKey: folderId,
          }),
        )
        .filter((folder): folder is FavoriteFolder => isDefined(folder));
    },
});
