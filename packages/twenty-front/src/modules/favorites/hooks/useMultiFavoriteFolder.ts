import { useFavorites } from '@/favorites/hooks/useFavorites';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useFavoriteFoldersScopedStates } from './useFavoriteFoldersScopedStates';

type useMultiFavoriteFolderProps = {
  record?: ObjectRecord;
  objectNameSingular: string;
};

type FolderOperations = {
  getFoldersByIds: () => FavoriteFolder[];
  toggleFolderSelection: (folderId: string) => Promise<void>;
  syncCheckedFavoriteState: () => void;
};

export const useMultiFavoriteFolder = ({
  record,
  objectNameSingular,
}: useMultiFavoriteFolderProps): FolderOperations => {
  const {
    favoriteFoldersIdsMultiSelectState,
    favoriteFolderMultiSelectFamilyState,
    favoriteFoldersMultiSelectCheckedState,
  } = useFavoriteFoldersScopedStates();

  const favoriteFoldersIdsMultiSelect = useRecoilValue(
    favoriteFoldersIdsMultiSelectState,
  );
  const setCheckedState = useSetRecoilState(
    favoriteFoldersMultiSelectCheckedState,
  );

  const { createFavorite, deleteFavorite, favorites } = useFavorites();
  const syncCheckedFavoriteState = () => {
    if (!record?.id) return;

    // Get all folders that have favorites for this record
    const checkedFolderIds = favorites
      .filter((favorite) => favorite.recordId === record.id)
      .map((favorite) => favorite.favoriteFolderId || 'no-folder');

    // Update the checked state
    setCheckedState(checkedFolderIds);
  };

  const getFoldersByIds = useRecoilCallback(
    ({ snapshot }) =>
      (): FavoriteFolder[] => {
        return favoriteFoldersIdsMultiSelect
          .map((folderId) => {
            const folderValue = snapshot
              .getLoadable(favoriteFolderMultiSelectFamilyState(folderId))
              .getValue();

            return folderValue;
          })
          .filter((folder): folder is FavoriteFolder => isDefined(folder));
      },
    [favoriteFoldersIdsMultiSelect, favoriteFolderMultiSelectFamilyState],
  );

  const toggleFolderSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      async (folderId: string) => {
        const handleNoFolderDeletion = async () => {
          const favoritesToDelete = favorites.filter(
            (favorite) =>
              !favorite.favoriteFolderId && favorite.recordId === record?.id,
          );

          for (const favorite of favoritesToDelete) {
            await deleteFavorite(favorite.id);
          }
        };

        const handleFolderDeletion = async (folderId: string) => {
          const favoriteToDelete = favorites.find(
            (favorite) => favorite.favoriteFolderId === folderId,
          );

          if (!isDefined(favoriteToDelete)) {
            return;
          }

          await deleteFavorite(favoriteToDelete.id);
        };

        const checkedIds = snapshot
          .getLoadable(favoriteFoldersMultiSelectCheckedState)
          .getValue();

        const isAlreadyChecked = checkedIds.includes(folderId);

        if (isAlreadyChecked) {
          if (folderId === 'no-folder') {
            await handleNoFolderDeletion();
          } else {
            await handleFolderDeletion(folderId);
          }

          set(
            favoriteFoldersMultiSelectCheckedState,
            checkedIds.filter((id) => id !== folderId),
          );
          return;
        }

        if (!isDefined(record)) {
          return;
        }

        const folderIdToUse = folderId === 'no-folder' ? undefined : folderId;
        await createFavorite(record, objectNameSingular, folderIdToUse);

        set(favoriteFoldersMultiSelectCheckedState, [...checkedIds, folderId]);
      },
    [
      favoriteFoldersMultiSelectCheckedState,
      createFavorite,
      deleteFavorite,
      favorites,
      record,
      objectNameSingular,
    ],
  );

  return {
    getFoldersByIds,
    toggleFolderSelection,
    syncCheckedFavoriteState,
  };
};
