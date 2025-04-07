import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
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
      text={getActionLabel(action.label)}
    />
  );
};
