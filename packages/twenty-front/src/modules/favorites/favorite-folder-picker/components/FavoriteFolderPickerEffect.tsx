import { useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-ui';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { favoriteFolderIdsPickerComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderIdPickerComponentState';
import { favoriteFolderPickerCheckedComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerCheckedComponentState';
import { favoriteFolderPickerComponentFamilyState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerComponentFamilyState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedFavoritesFoldersData } from '@/favorites/hooks/usePrefetchedFavoritesFoldersData';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';

type FavoriteFolderPickerEffectProps = {
  record?: ObjectRecord;
};

export const FavoriteFolderPickerEffect = ({
  record,
}: FavoriteFolderPickerEffectProps) => {
  const [favoriteFolderIdsPicker, setFavoriteFolderIdsPicker] =
    useRecoilComponentStateV2(favoriteFolderIdsPickerComponentState);

  const favoriteFolderPickerFamilyState = useRecoilComponentCallbackStateV2(
    favoriteFolderPickerComponentFamilyState,
  );

  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();

  const { sortedFavorites: favorites } = useFavorites();
  const setCheckedState = useSetRecoilComponentStateV2(
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
          favorite.recordId === targetId && favorite.workspaceMemberId,
      )
      .map((favorite) => favorite.favoriteFolderId || 'no-folder');
    setCheckedState(checkedFolderIds);
  }, [favorites, setCheckedState, record?.id]);

  return null;
};
