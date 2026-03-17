import { CommandMenuItemButton } from '@/command-menu-item/display/components/CommandMenuItemButton';
import { CommandDropdownItem } from '@/command-menu-item/display/components/CommandDropdownItem';
import { CommandListItem } from '@/command-menu-item/display/components/CommandListItem';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
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
  progress,
}: {
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  to?: string;
  disabled?: boolean;
  progress?: number;
}) => {
  const action = useContext(CommandConfigContext);
  const { displayType } = useContext(CommandMenuContext);

  if (!action) {
    return null;
  }

  if (displayType === 'button') {
    return <CommandMenuItemButton action={action} onClick={onClick} to={to} />;
  }

  if (displayType === 'listItem') {
    return (
      <CommandListItem
        action={action}
        onClick={onClick}
        to={to}
        disabled={disabled}
        progress={progress}
      />
    );
  }

  if (displayType === 'dropdownItem') {
    return <CommandDropdownItem action={action} onClick={onClick} to={to} />;
  }

  return assertUnreachable(displayType, 'Unsupported display type');
};
