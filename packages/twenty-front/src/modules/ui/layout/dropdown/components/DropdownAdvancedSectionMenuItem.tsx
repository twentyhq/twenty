import { Trans } from '@lingui/react/macro';
import { IconSettings } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

type DropdownAdvancedSectionMenuItemProps = {
  onClick: () => void;
};

export const DropdownAdvancedSectionMenuItem = ({
  onClick,
}: DropdownAdvancedSectionMenuItemProps) => (
  <MenuItem
    text={<Trans>Advanced</Trans>}
    LeftIcon={IconSettings}
    onClick={onClick}
    hasSubMenu
  />
);
