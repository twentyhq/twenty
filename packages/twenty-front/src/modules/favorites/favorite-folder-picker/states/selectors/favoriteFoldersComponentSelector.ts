import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { favoriteFolderIdsPickerComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderIdPickerComponentState';
import { favoriteFolderPickerComponentFamilyState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerComponentFamilyState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { isDefined } from 'twenty-ui';

export const favoriteFoldersComponentSelector = createComponentSelectorV2<
  FavoriteFolder[]
>({
  key: 'favoriteFoldersComponentSelector',
  componentInstanceContext: FavoriteFolderPickerInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const folderIds = get(
        favoriteFolderIdsPickerComponentState.atomFamily({ instanceId }),
      );

      return folderIds
        .map((folderId: string) =>
          get(
            favoriteFolderPickerComponentFamilyState.atomFamily({
              instanceId,
              familyKey: folderId,
            }),
          ),
        )
        .filter((folder): folder is FavoriteFolder => isDefined(folder));
    },
});
