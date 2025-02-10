import { LightIconButton } from '@ui/input/button/components/LightIconButton';
import { IconDotsVertical } from 'twenty-ui';

type FavoriteFolderNavigationDrawerItemDropdownButtonProps = {
  dropdownId: string;
  isDropdownOpen: boolean;
};

export const FavoriteFolderNavigationDrawerItemDropdownButton = ({
  dropdownId,
  isDropdownOpen,
}: FavoriteFolderNavigationDrawerItemDropdownButtonProps) => {
  return (
    <LightIconButton
      Icon={IconDotsVertical}
      accent="tertiary"
      aria-controls={`${dropdownId}-options`}
      aria-expanded={isDropdownOpen}
      aria-haspopup={true}
    />
  );
};
