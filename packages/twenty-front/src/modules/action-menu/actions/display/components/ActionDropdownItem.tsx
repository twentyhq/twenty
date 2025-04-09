import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';

export const ActionDropdownItem = ({
  action,
  onClick,
  to,
}: {
  action: ActionDisplayProps;
  onClick: (event?: React.MouseEvent<HTMLElement>) => void;
  to?: string;
}) => {
  const navigate = useNavigate();

  return (
    <MenuItem
      key={action.key}
      LeftIcon={action.Icon}
      onClick={() => {
        onClick();
        if (isDefined(to)) {
          navigate(to);
        }
      }}
      text={getActionLabel(action.label)}
    />
  );
};
