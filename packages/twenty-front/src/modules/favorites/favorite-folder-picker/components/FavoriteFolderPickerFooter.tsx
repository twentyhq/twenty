import { isFavoriteFolderCreatingStateV2 } from '@/favorites/states/isFavoriteFolderCreatingStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const FavoriteFolderPickerFooter = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  const { t } = useLingui();
  const [, setIsFavoriteFolderCreating] = useRecoilStateV2(
    isFavoriteFolderCreatingStateV2,
  );
  const setIsNavigationDrawerExpanded = useSetRecoilStateV2(
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
