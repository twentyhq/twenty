import { CommandMenuItemButton } from '@/command-menu-item/actions/display/components/CommandMenuItemButton';
import { CommandMenuItemDropdownItem } from '@/command-menu-item/actions/display/components/CommandMenuItemDropdownItem';
import { CommandMenuItemListItem } from '@/command-menu-item/actions/display/components/CommandMenuItemListItem';
import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { type MessageDescriptor } from '@lingui/core';
import { useContext } from 'react';
import { assertUnreachable } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { type MenuItemAccent } from 'twenty-ui/navigation';

export type CommandMenuItemDisplayProps = {
  key: string;
  label: MessageDescriptor | string;
  shortLabel?: MessageDescriptor | string;
  description?: MessageDescriptor | string;
  Icon: IconComponent;
  isPrimaryCTA?: boolean;
  accent?: MenuItemAccent;
  hotKeys?: string[];
};

export const CommandMenuItemDisplay = ({
  onClick,
  to,
  disabled,
}: {
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  to?: string;
  disabled?: boolean;
}) => {
  const action = useContext(CommandMenuItemConfigContext);
  const { displayType } = useContext(CommandMenuItemContext);

  if (!action) {
    return null;
  }

  if (displayType === 'button') {
    return <CommandMenuItemButton action={action} onClick={onClick} to={to} />;
  }

  if (displayType === 'listItem') {
    return (
      <CommandMenuItemListItem
        action={action}
        onClick={onClick}
        to={to}
        disabled={disabled}
      />
    );
  }

  if (displayType === 'dropdownItem') {
    return <CommandMenuItemDropdownItem action={action} onClick={onClick} to={to} />;
  }

  return assertUnreachable(displayType, 'Unsupported display type');
};
