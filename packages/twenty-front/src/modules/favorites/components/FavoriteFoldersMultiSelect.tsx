import { FAVORITE_FOLDERS_DROPDOWN_ID } from '@/favorites/constants/FavoriteFoldersDropdownId';
import { useFavoriteFoldersScopedStates } from '@/favorites/hooks/useFavoriteFoldersScopedStates';
import { useMultiFavoriteFolder } from '@/favorites/hooks/useMultiFavoriteFolder';
import { FavoriteFoldersScopeInternalContext } from '@/favorites/scopes/scope-internal-context/favoritesScopeInternalContext';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconPlus, MenuItem, MenuItemMultiSelect } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

const StyledDropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledItemsContainer = styled.div`
  width: 100%;
  max-height: 160px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
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

const StyledIconPlus = styled(IconPlus)`
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledDropdownMenuSeparator = styled(DropdownMenuSeparator)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const NO_FOLDER_ID = 'no-folder';

export const FavoriteFoldersMultiSelect = ({
  onSubmit,
  record,
  objectNameSingular,
}: FavoriteFoldersMultiSelectProps) => {
  const [isFavoriteFolderCreating, setIsFavoriteFolderCreating] =
    useRecoilState(isFavoriteFolderCreatingState);

  const theme = useTheme();

  const scopeId = useAvailableScopeIdOrThrow(
    FavoriteFoldersScopeInternalContext,
  );

  const { closeDropdown } = useDropdown(FAVORITE_FOLDERS_DROPDOWN_ID);

  const {
    favoriteFoldersSearchFilterState,
    favoriteFoldersMultiSelectCheckedState,
  } = useFavoriteFoldersScopedStates();

  const { getFoldersByIds, toggleFolderSelection } = useMultiFavoriteFolder({
    record,
    objectNameSingular,
  });

  const [favoriteFoldersSearchFilter, setFavoriteFoldersSearchFilter] =
    useRecoilState(favoriteFoldersSearchFilterState);

  const favoriteFoldersMultiSelectChecked = useRecoilValue(
    favoriteFoldersMultiSelectCheckedState,
  );

  const debouncedSetSearchFilter = useDebouncedCallback(
    setFavoriteFoldersSearchFilter,
    100,
    { leading: true },
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

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSetSearchFilter(event.currentTarget.value);
    },
    [debouncedSetSearchFilter],
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

  useScopedHotkeys(
    Key.Enter,
    () => {
      if (filteredFolders.length === 1 && !showNoFolderOption) {
        toggleFolderSelection(filteredFolders[0].id);
        onSubmit?.();
        return;
      }

      if (showNoFolderOption && filteredFolders.length === 0) {
        toggleFolderSelection(NO_FOLDER_ID);
        onSubmit?.();
        return;
      }
    },
    scopeId,
    [filteredFolders, showNoFolderOption, toggleFolderSelection, onSubmit],
  );

  return (
    <DropdownMenu data-select-disable>
      <StyledDropdownContainer>
        <DropdownMenuSearchInput
          value={favoriteFoldersSearchFilter}
          onChange={handleFilterChange}
          autoFocus
        />
        <DropdownMenuSeparator />

        <DropdownMenuItemsContainer>
          <StyledItemsContainer>
            {showNoFolderOption && (
              <MenuItemMultiSelect
                key={`menu-${NO_FOLDER_ID}`}
                onSelectChange={() => toggleFolderSelection(NO_FOLDER_ID)}
                selected={favoriteFoldersMultiSelectChecked.includes(
                  NO_FOLDER_ID,
                )}
                text="No folder"
                className="no-folder-menu-item-multi-select"
              />
            )}
            {showNoFolderOption && filteredFolders.length > 0 && (
              <StyledDropdownMenuSeparator />
            )}
            {filteredFolders.length > 0
              ? filteredFolders.map((folder) => (
                  <MenuItemMultiSelect
                    key={`menu-${folder.id}`}
                    onSelectChange={() => toggleFolderSelection(folder.id)}
                    selected={favoriteFoldersMultiSelectChecked.includes(
                      folder.id,
                    )}
                    text={folder.name}
                    className="folder-menu-item-multi-select"
                  />
                ))
              : !showNoFolderOption && <MenuItem text="No folders found" />}
          </StyledItemsContainer>
        </DropdownMenuItemsContainer>
        <StyledFooter>
          <MenuItem
            className="add-folder"
            onClick={() => {
              setIsFavoriteFolderCreating(true);
              closeDropdown();
            }}
            text="Add folder"
            LeftIcon={() => <StyledIconPlus size={theme.icon.size.md} />}
          />
        </StyledFooter>
      </StyledDropdownContainer>
    </DropdownMenu>
  );
};
