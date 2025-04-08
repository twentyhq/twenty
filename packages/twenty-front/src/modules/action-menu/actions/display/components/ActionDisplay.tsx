import { ActionButton } from '@/action-menu/actions/display/components/ActionButton';
import { ActionDropdownItem } from '@/action-menu/actions/display/components/ActionDropdownItem';
import { ActionListItem } from '@/action-menu/actions/display/components/ActionListItem';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { MessageDescriptor } from '@lingui/core';
import { useContext } from 'react';
import { IconComponent } from 'twenty-ui/display';
import { MenuItemAccent } from 'twenty-ui/navigation';

export type ActionDisplayProps = {
  key: string;
  label: MessageDescriptor | string;
  shortLabel?: MessageDescriptor | string;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  to?: string;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  hotKeys?: string[];
};

export const ActionDisplay = ({ action }: { action: ActionDisplayProps }) => {
  const { displayType } = useContext(ActionMenuContext);

  if (!action) {
    return null;
  }

  if (displayType === 'button') {
    return <ActionButton action={action} />;
  }

  if (displayType === 'listItem') {
    return <ActionListItem action={action} />;
  }

  if (displayType === 'dropdownItem') {
    return <ActionDropdownItem action={action} />;
  }

  throw new Error(`Unsupported display type: ${displayType}`);
};
