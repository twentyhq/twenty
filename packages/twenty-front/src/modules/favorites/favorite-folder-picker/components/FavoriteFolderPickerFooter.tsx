import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const FavoriteFolderPickerFooter = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  const { t } = useLingui();
  const [, setIsFavoriteFolderCreating] = useRecoilState(
    isFavoriteFolderCreatingState,
  );
  const setIsNavigationDrawerExpanded = useSetRecoilState(
    isNavigationDrawerExpandedState,
  );
  const { openNavigationSection } = useNavigationSection('Favorites');
  const theme = useTheme();
  const { closeDropdown } = useCloseDropdown();

  return (
    <DropdownMenuItemsContainer scrollable={false}>
      <MenuItem
        className="add-folder"
        onClick={() => {
          setIsNavigationDrawerExpanded(true);
          openNavigationSection();
          setIsFavoriteFolderCreating(true);
          closeDropdown(dropdownId);
        }}
        text={t`Add folder`}
        LeftIcon={() => <IconPlus size={theme.icon.size.md} />}
      />
    </DropdownMenuItemsContainer>
  );
};
