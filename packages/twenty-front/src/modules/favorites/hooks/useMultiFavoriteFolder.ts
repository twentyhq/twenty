import { useFavorites } from '@/favorites/hooks/useFavorites';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';
import { useFavoriteFoldersScopedStates } from './useFavoriteFoldersScopedStates';

type useMultiFavoriteFolderProps = {
  record?: ObjectRecord;
  objectNameSingular: string;
};

type FolderOperations = {
  getFoldersByIds: () => FavoriteFolder[];
  toggleFolderSelection: (folderId: string) => Promise<void>;
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

  const { createFavorite, deleteFavorite, favorites } = useFavorites();

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
        const targetId = record?.id;
        const targetObject = record;

        if (!isDefined(targetObject) || !isDefined(targetId)) {
          return;
        }

        const handleNoFolderDeletion = async () => {
          const favoritesToDelete = favorites.filter(
            (favorite) =>
              !favorite.favoriteFolderId && favorite.recordId === targetId,
          );

          for (const favorite of favoritesToDelete) {
            await deleteFavorite(favorite.id);
          }
        };

        const handleFolderDeletion = async (folderId: string) => {
          const favoriteToDelete = favorites.find(
            (favorite) =>
              favorite.favoriteFolderId === folderId &&
              favorite.recordId === targetId,
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

        const folderIdToUse = folderId === 'no-folder' ? undefined : folderId;

        if (isDefined(record)) {
          await createFavorite(record, objectNameSingular, folderIdToUse);
        }

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
  };
};
