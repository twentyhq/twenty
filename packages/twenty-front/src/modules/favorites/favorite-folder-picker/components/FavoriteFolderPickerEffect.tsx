import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { favoriteFolderIdsPickerComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderIdPickerComponentState';
import { favoriteFolderPickerCheckedComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerCheckedComponentState';
import { favoriteFolderPickerComponentFamilyState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerComponentFamilyState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedFavoritesFoldersData } from '@/favorites/hooks/usePrefetchedFavoritesFoldersData';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { isDefined } from 'twenty-shared/utils';

type FavoriteFolderPickerEffectProps = {
  record?: ObjectRecord;
};

export const FavoriteFolderPickerEffect = ({
  record,
}: FavoriteFolderPickerEffectProps) => {
  const [favoriteFolderIdsPicker, setFavoriteFolderIdsPicker] =
    useRecoilComponentState(favoriteFolderIdsPickerComponentState);

  const favoriteFolderPickerFamilyState = useRecoilComponentCallbackState(
    favoriteFolderPickerComponentFamilyState,
  );

  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();

  const { sortedFavorites: favorites } = useFavorites();
  const setCheckedState = useSetRecoilComponentState(
    favoriteFolderPickerCheckedComponentState,
  );

  const updateFolders = useRecoilCallback(
    ({ snapshot, set }) =>
      (folders: FavoriteFolder[]) => {
        folders.forEach((folder) => {
          const currentFolder = snapshot
            .getLoadable(favoriteFolderPickerFamilyState(folder.id))
            .getValue();

          if (!isDeeplyEqual(folder, currentFolder)) {
            set(favoriteFolderPickerFamilyState(folder.id), folder);
          }
        });
      },
    [favoriteFolderPickerFamilyState],
  );

  useEffect(() => {
    if (isDefined(favoriteFolders)) {
      updateFolders(favoriteFolders);

      const folderIds = favoriteFolders.map((folder) => folder.id);
      if (!isDeeplyEqual(folderIds, favoriteFolderIdsPicker)) {
        setFavoriteFolderIdsPicker(folderIds);
      }
    }
  }, [
    favoriteFolders,
    favoriteFolderIdsPicker,
    setFavoriteFolderIdsPicker,
    updateFolders,
  ]);

  useEffect(() => {
    const targetId = record?.id;
    const checkedFolderIds = favorites
      .filter(
        (favorite) =>
          favorite.recordId === targetId && favorite.forWorkspaceMemberId,
      )
      .map((favorite) => favorite.favoriteFolderId || 'no-folder');
    setCheckedState(checkedFolderIds);
  }, [favorites, setCheckedState, record?.id]);

  return null;
};
