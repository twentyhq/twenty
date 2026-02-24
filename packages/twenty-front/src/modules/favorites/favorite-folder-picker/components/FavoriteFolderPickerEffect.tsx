import { useCallback, useEffect } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

import { favoriteFolderIdsPickerComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderIdPickerComponentState';
import { favoriteFolderPickerCheckedComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerCheckedComponentState';
import { favoriteFolderPickerComponentFamilyState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerComponentFamilyState';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { usePrefetchedFavoritesFoldersData } from '@/favorites/hooks/usePrefetchedFavoritesFoldersData';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { isDefined } from 'twenty-shared/utils';

type FavoriteFolderPickerEffectProps = {
  record?: ObjectRecord;
};

export const FavoriteFolderPickerEffect = ({
  record,
}: FavoriteFolderPickerEffectProps) => {
  const [favoriteFolderIdsPicker, setFavoriteFolderIdsPicker] =
    useRecoilComponentStateV2(favoriteFolderIdsPickerComponentState);

  const favoriteFolderPickerFamilyAtom =
    useRecoilComponentFamilyStateCallbackStateV2(
      favoriteFolderPickerComponentFamilyState,
    );

  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();

  const { sortedFavorites: favorites } = useFavorites();
  const setCheckedState = useSetRecoilComponentStateV2(
    favoriteFolderPickerCheckedComponentState,
  );

  const updateFolders = useCallback(
    (folders: FavoriteFolder[]) => {
      folders.forEach((folder) => {
        const atom = favoriteFolderPickerFamilyAtom(folder.id);
        const currentFolder = jotaiStore.get(atom);

        if (!isDeeplyEqual(folder, currentFolder)) {
          jotaiStore.set(atom, folder);
        }
      });
    },
    [favoriteFolderPickerFamilyAtom],
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
