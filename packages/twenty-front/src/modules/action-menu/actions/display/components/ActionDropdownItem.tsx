import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { i18n } from '@lingui/core';
import { MenuItem } from 'twenty-ui/navigation';

export const ActionDropdownItem = ({
  action,
}: {
  action: ActionDisplayProps;
}) => {
  return (
    <MenuItem
      key={action.key}
      LeftIcon={action.Icon}
      onClick={action?.onClick}
      text={i18n._(action.label)}
    />
  );
};
