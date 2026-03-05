import { isFavoriteFolderCreatingState } from '@/favorites/states/isFavoriteFolderCreatingState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { ThemeContext } from 'twenty-ui/theme-constants';
export const FavoriteFolderPickerFooter = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const [, setIsFavoriteFolderCreating] = useAtomState(
    isFavoriteFolderCreatingState,
  );
  const setIsNavigationDrawerExpanded = useSetAtomState(
    isNavigationDrawerExpandedState,
  );
  const { openNavigationSection } = useNavigationSection('Favorites');
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
