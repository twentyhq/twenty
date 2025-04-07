import { ActionButton } from '@/action-menu/actions/display/components/ActionButton';
import { ActionDropdownItem } from '@/action-menu/actions/display/components/ActionDropdownItem';
import { ActionListItem } from '@/action-menu/actions/display/components/ActionListItem';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';

import { MessageDescriptor } from '@lingui/core';
import { useContext } from 'react';
import { IconComponent, MenuItemAccent } from 'twenty-ui';

export type ActionDisplayProps = {
  key: string;
  label: MessageDescriptor;
  shortLabel?: MessageDescriptor;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  to?: string;
  onClick?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
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
};
