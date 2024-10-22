import { useCallback, useRef } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';

import { useFavoriteFoldersScopedStates } from '@/favorites/hooks/useFavoriteFoldersScopedStates';
import { FavoriteFoldersScopeInternalContext } from '@/favorites/scopes/scope-internal-context/favoritesScopeInternalContext';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';

import { Checkbox } from '@/ui/input/components/Checkbox';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

type FavoriteFoldersMultiSelectProps = {
  onSubmit?: () => void;
};

export const FavoriteFoldersMultiSelect = ({
  onSubmit,
}: FavoriteFoldersMultiSelectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const favoriteFoldersScopedId = useAvailableScopeIdOrThrow(
    FavoriteFoldersScopeInternalContext,
  );

  const {
    favoritesSearchFilterState,
    favoriteFoldersIdsMultiSelectState,
    favoriteFoldersLoadingState,
    favoriteFoldersMultiSelectCheckedState,
  } = useFavoriteFoldersScopedStates();

  const favoritesSearchFilter = useRecoilValue(favoritesSearchFilterState);
  const setSearchFilter = useSetRecoilState(favoritesSearchFilterState);
  const favoriteFoldersLoading = useRecoilValue(favoriteFoldersLoadingState);
  const favoriteFoldersIdsMultiSelect = useRecoilValue<FavoriteFolder[]>(
    favoriteFoldersIdsMultiSelectState,
  );
  const favoriteFoldersMultiSelectChecked = useRecoilValue(
    favoriteFoldersMultiSelectCheckedState,
  );
  const setCheckedFolderIds = useSetRecoilState(
    favoriteFoldersMultiSelectCheckedState,
  );

  const debouncedSetSearchFilter = useDebouncedCallback(setSearchFilter, 100, {
    leading: true,
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      onSubmit?.();
    },
    favoriteFoldersScopedId,
    [onSubmit],
  );

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearchFilter(event.currentTarget.value);
    },
    [debouncedSetSearchFilter],
  );

  const handleCheckboxChange = useCallback(
    (folderId: string) => {
      setCheckedFolderIds((previousCheckedIds) => {
        if (previousCheckedIds.includes(folderId)) {
          return previousCheckedIds.filter((id) => id !== folderId);
        }
        return [...previousCheckedIds, folderId];
      });
    },
    [setCheckedFolderIds],
  );

  const filteredFolders = favoriteFoldersIdsMultiSelect.filter((folder) =>
    folder.name.toLowerCase().includes(favoritesSearchFilter.toLowerCase()),
  );

  return (
    <DropdownMenu ref={containerRef} data-select-disable>
      <DropdownMenuSearchInput
        value={favoritesSearchFilter}
        onChange={handleFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {favoriteFoldersLoading ? (
          <MenuItem text="Loading..." />
        ) : (
          <>
            {filteredFolders.length > 0 ? (
              filteredFolders.map((folder) => (
                <MenuItem
                  key={folder.id}
                  onClick={() => handleCheckboxChange(folder.id)}
                  LeftIcon={() => (
                    <Checkbox
                      checked={favoriteFoldersMultiSelectChecked.includes(
                        folder.id,
                      )}
                      onChange={() => handleCheckboxChange(folder.id)}
                    />
                  )}
                  text={folder.name}
                />
              ))
            ) : (
              <MenuItem text="No folders found" />
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
