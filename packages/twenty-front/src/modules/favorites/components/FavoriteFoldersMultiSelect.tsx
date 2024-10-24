import styled from '@emotion/styled';
import { useCallback, useRef, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';
import { useDebouncedCallback } from 'use-debounce';

import { useFavoriteFoldersScopedStates } from '@/favorites/hooks/useFavoriteFoldersScopedStates';
import { useMultiFavoriteFolder } from '@/favorites/hooks/useMultiFavoriteFolder';
import { FavoriteFoldersScopeInternalContext } from '@/favorites/scopes/scope-internal-context/favoritesScopeInternalContext';

import { useFavoriteFolders } from '@/favorites/hooks/useFavoriteFolders';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Checkbox } from '@/ui/input/components/Checkbox';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
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

const StyledDropdownMenuInput = styled(DropdownMenuInput)`
  font-size: ${({ theme }) => theme.font.size.md};
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const scopeId = useAvailableScopeIdOrThrow(
    FavoriteFoldersScopeInternalContext,
  );

  const {
    favoriteFoldersSearchFilterState,
    favoriteFoldersMultiSelectCheckedState,
  } = useFavoriteFoldersScopedStates();

  const { getFoldersByIds, toggleFolderSelection } = useMultiFavoriteFolder({
    record,
    objectNameSingular,
  });

  const { createFolder } = useFavoriteFolders();

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
    {
      leading: true,
    },
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      if (isCreatingNewFolder) {
        setIsCreatingNewFolder(false);
        return;
      }
      onSubmit?.();
    },
    scopeId,
    [onSubmit, isCreatingNewFolder],
  );

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearchFilter(event.currentTarget.value);
    },
    [debouncedSetSearchFilter],
  );

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    await createFolder(newFolderName);
    setNewFolderName('');
    setIsCreatingNewFolder(false);
  };

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
    <DropdownMenu ref={containerRef} data-select-disable>
      <StyledDropdownContainer>
        {isCreatingNewFolder ? (
          <StyledDropdownMenuInput
            autoFocus
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            onEnter={handleCreateFolder}
            rightComponent={
              <LightIconButton Icon={IconPlus} onClick={handleCreateFolder} />
            }
          />
        ) : (
          <StyledMainDropdown isVisible={!isCreatingNewFolder}>
            <DropdownMenuSearchInput
              value={favoriteFoldersSearchFilter}
              onChange={handleFilterChange}
              autoFocus
            />
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer hasMaxHeight>
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
              <DropdownMenuSeparator />
              <MenuItem
                onClick={() => setIsCreatingNewFolder(true)}
                text="Add folder"
                LeftIcon={IconPlus}
              />
            </DropdownMenuItemsContainer>
          </StyledMainDropdown>
        )}
      </StyledDropdownContainer>
    </DropdownMenu>
  );
};
