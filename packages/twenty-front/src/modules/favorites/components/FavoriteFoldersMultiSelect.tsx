import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';

import { useFavoriteFoldersScopedStates } from '@/favorites/hooks/useFavoriteFoldersScopedStates';
import { useMultiFavoriteFolder } from '@/favorites/hooks/useMultiFavoriteFolder';
import { FavoriteFoldersScopeInternalContext } from '@/favorites/scopes/scope-internal-context/favoritesScopeInternalContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { Checkbox } from '@/ui/input/components/Checkbox';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { IconPlus } from 'twenty-ui';

const StyledDropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledMainDropdown = styled.div<{ isVisible: boolean }>`
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  transition: all 150ms ease-in-out;
`;

const StyledItemsContainer = styled.div`
  max-height: 160px;
  overflow-y: auto;
`;

const StyledFooter = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.md};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.md};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
  bottom: 0;
  position: sticky;
`;

type FavoriteFoldersMultiSelectProps = {
  onSubmit?: () => void;
  record?: ObjectRecord;
  objectNameSingular: string;
};

const NO_FOLDER_ID = 'no-folder';

export const FavoriteFoldersMultiSelect = ({
  onSubmit,
  record,
  objectNameSingular,
}: FavoriteFoldersMultiSelectProps) => {
  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilState(isFavoriteFolderCreatingState);

  const scopeId = useAvailableScopeIdOrThrow(
    FavoriteFoldersScopeInternalContext,
  );

  const { closeDropdown } = useDropdown('favorite-folders-dropdown');

  const {
    favoriteFoldersSearchFilterState,
    favoriteFoldersMultiSelectCheckedState,
  } = useFavoriteFoldersScopedStates();

  const { getFoldersByIds, toggleFolderSelection } = useMultiFavoriteFolder({
    record,
    objectNameSingular,
  });

  const favoriteFoldersSearchFilter = useRecoilValue(
    favoriteFoldersSearchFilterState,
  );
  const setFavoriteFoldersSearchFilter = useSetRecoilState(
    favoriteFoldersSearchFilterState,
  );
  const favoriteFoldersMultiSelectChecked = useRecoilValue(
    favoriteFoldersMultiSelectCheckedState,
  );

  const debouncedSetSearchFilter = useDebouncedCallback(
    setFavoriteFoldersSearchFilter,
    100,
    { leading: true },
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      if (isFavoriteFolderCreating) {
        setIsFavoriteFolderCreating(false);
        return;
      }
      onSubmit?.();
    },
    scopeId,
    [onSubmit, isFavoriteFolderCreating],
  );

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearchFilter(event.currentTarget.value);
    },
    [debouncedSetSearchFilter],
  );

  const folders = getFoldersByIds();
  const filteredFolders = folders.filter((folder) =>
    folder.name
      .toLowerCase()
      .includes(favoriteFoldersSearchFilter.toLowerCase()),
  );

  const showNoFolderOption =
    !favoriteFoldersSearchFilter ||
    'no folder'.includes(favoriteFoldersSearchFilter.toLowerCase());

  return (
    <DropdownMenu data-select-disable>
      <StyledDropdownContainer>
        <StyledMainDropdown isVisible={!isFavoriteFolderCreating}>
          <DropdownMenuSearchInput
            value={favoriteFoldersSearchFilter}
            onChange={handleFilterChange}
            autoFocus
          />
          <DropdownMenuSeparator />
          <StyledItemsContainer>
            {showNoFolderOption && (
              <MenuItem
                key={NO_FOLDER_ID}
                LeftIcon={() => (
                  <Checkbox
                    checked={favoriteFoldersMultiSelectChecked.includes(
                      NO_FOLDER_ID,
                    )}
                    onChange={() => toggleFolderSelection(NO_FOLDER_ID)}
                  />
                )}
                text="No folder"
              />
            )}
            {showNoFolderOption && filteredFolders.length > 0 && (
              <DropdownMenuSeparator />
            )}
            {filteredFolders.length > 0
              ? filteredFolders.map((folder) => (
                  <MenuItem
                    key={folder.id}
                    LeftIcon={() => (
                      <Checkbox
                        checked={favoriteFoldersMultiSelectChecked.includes(
                          folder.id,
                        )}
                        onChange={() => toggleFolderSelection(folder.id)}
                      />
                    )}
                    text={folder.name}
                  />
                ))
              : !showNoFolderOption && <MenuItem text="No folders found" />}
          </StyledItemsContainer>
          <StyledFooter>
            <MenuItem
              onClick={() => {
                setIsFavoriteFolderCreating(true);
                closeDropdown();
              }}
              text="Add folder"
              LeftIcon={IconPlus}
            />
          </StyledFooter>
        </StyledMainDropdown>
      </StyledDropdownContainer>
    </DropdownMenu>
  );
};

export default FavoriteFoldersMultiSelect;
