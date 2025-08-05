import { favoriteFolderPickerCheckedComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFolderPickerCheckedComponentState';
import { favoriteFolderSearchFilterComponentState } from '@/favorites/favorite-folder-picker/states/favoriteFoldersSearchFilterComponentState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import styled from '@emotion/styled';
import { MenuItem, MenuItemMultiSelect } from 'twenty-ui/navigation';

const StyledItemsContainer = styled.div`
  width: 100%;
`;

const StyledDropdownMenuSeparator = styled(DropdownMenuSeparator)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type FavoriteFolderPickerListProps = {
  folders: FavoriteFolder[];
  toggleFolderSelection: (folderId: string) => void;
};

export const NO_FOLDER_ID = 'no-folder';

export const FavoriteFolderPickerList = ({
  folders,
  toggleFolderSelection,
}: FavoriteFolderPickerListProps) => {
  const [favoriteFoldersSearchFilter] = useRecoilComponentState(
    favoriteFolderSearchFilterComponentState,
  );

  const [favoriteFolderPickerChecked] = useRecoilComponentState(
    favoriteFolderPickerCheckedComponentState,
  );

  const filteredFolders = folders.filter((folder) =>
    folder.name
      .toLowerCase()
      .includes(favoriteFoldersSearchFilter.toLowerCase()),
  );

  const showNoFolderOption =
    !favoriteFoldersSearchFilter ||
    'no folder'.includes(favoriteFoldersSearchFilter.toLowerCase());

  return (
    <StyledItemsContainer>
      {showNoFolderOption && (
        <MenuItemMultiSelect
          key={`menu-${NO_FOLDER_ID}`}
          onSelectChange={() => toggleFolderSelection(NO_FOLDER_ID)}
          selected={favoriteFolderPickerChecked.includes(NO_FOLDER_ID)}
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
              selected={favoriteFolderPickerChecked.includes(folder.id)}
              text={folder.name}
              className="folder-menu-item-multi-select"
            />
          ))
        : !showNoFolderOption && <MenuItem text="No folders found" />}
    </StyledItemsContainer>
  );
};
