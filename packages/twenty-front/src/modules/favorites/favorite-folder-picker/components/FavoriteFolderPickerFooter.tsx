import { FAVORITE_FOLDER_PICKER_DROPDOWN_ID } from '@/favorites/favorite-folder-picker/constants/FavoriteFolderPickerDropdownId';
import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { IconPlus, MenuItem } from 'twenty-ui';

const StyledFooter = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.md};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.md};
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

export const FavoriteFolderPickerFooter = () => {
  const [, setIsFavoriteFolderCreating] = useRecoilState(
    isFavoriteFolderCreatingState,
  );
  const setIsNavigationDrawerExpanded = useSetRecoilState(
    isNavigationDrawerExpandedState,
  );
  const { openNavigationSection } = useNavigationSection('Favorites');
  const theme = useTheme();
  const { closeDropdown } = useDropdown(FAVORITE_FOLDER_PICKER_DROPDOWN_ID);

  return (
    <StyledFooter>
      <DropdownMenuItemsContainer>
        <MenuItem
          className="add-folder"
          onClick={() => {
            setIsNavigationDrawerExpanded(true);
            openNavigationSection();
            setIsFavoriteFolderCreating(true);
            closeDropdown();
          }}
          text="Add folder"
          LeftIcon={() => <IconPlus size={theme.icon.size.md} />}
        />
      </DropdownMenuItemsContainer>
    </StyledFooter>
  );
};
