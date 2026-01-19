import { type ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const ActionListItem = ({
  action,
  onClick,
  to,
  disabled = false,
}: {
  action: ActionDisplayProps;
  onClick?: () => void;
  to?: string;
  disabled?: boolean;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (disabled) {
      return;
    }

    onClick?.();
    if (isDefined(to)) {
      navigate(to);
    }
  };

  return (
    <SelectableListItem itemId={action.key} onEnter={handleClick}>
      <CommandMenuItem
        id={action.key}
        Icon={action.Icon}
        label={getActionLabel(action.label)}
        description={getActionLabel(action.description ?? '')}
        to={to}
        onClick={onClick}
        hotKeys={action.hotKeys}
        disabled={disabled}
      />
    </SelectableListItem>
  );
};
