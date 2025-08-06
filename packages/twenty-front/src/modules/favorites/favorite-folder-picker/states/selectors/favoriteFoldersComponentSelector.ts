import { FavoriteFolderPickerInstanceContext } from '@/favorites/favorite-folder-picker/states/context/FavoriteFolderPickerInstanceContext';
import { favoriteFolderIdsPickerComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderIdPickerComponentState';
import { favoriteFolderPickerComponentFamilyState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerComponentFamilyState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { isDefined } from 'twenty-shared/utils';

export const favoriteFoldersComponentSelector = createComponentSelector<
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
