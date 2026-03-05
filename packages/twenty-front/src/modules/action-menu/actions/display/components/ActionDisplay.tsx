import { ActionButton } from '@/action-menu/actions/display/components/ActionButton';
import { ActionDropdownItem } from '@/action-menu/actions/display/components/ActionDropdownItem';
import { ActionListItem } from '@/action-menu/actions/display/components/ActionListItem';
import { CommandMenuItemConfigContext } from '@/action-menu/contexts/CommandMenuItemConfigContext';
import { CommandMenuItemContext } from '@/action-menu/contexts/CommandMenuItemContext';
import { type MessageDescriptor } from '@lingui/core';
import { useContext } from 'react';
import { assertUnreachable } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';
import { type MenuItemAccent } from 'twenty-ui/navigation';

export type ActionDisplayProps = {
  key: string;
  label: MessageDescriptor | string;
  shortLabel?: MessageDescriptor | string;
  description?: MessageDescriptor | string;
  Icon: IconComponent;
  isPrimaryCTA?: boolean;
  accent?: MenuItemAccent;
  hotKeys?: string[];
};

export const ActionDisplay = ({
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
    return <ActionButton action={action} onClick={onClick} to={to} />;
  }

  if (displayType === 'listItem') {
    return (
      <ActionListItem
        action={action}
        onClick={onClick}
        to={to}
        disabled={disabled}
      />
    );
  }

  if (displayType === 'dropdownItem') {
    return <ActionDropdownItem action={action} onClick={onClick} to={to} />;
  }

  return assertUnreachable(displayType, 'Unsupported display type');
};
