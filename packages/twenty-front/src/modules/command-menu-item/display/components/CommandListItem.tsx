import { type CommandMenuItemDisplayProps } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';

export const CommandListItem = ({
  action,
  onClick,
  to,
  disabled = false,
}: {
  action: CommandMenuItemDisplayProps;
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
        label={getCommandMenuItemLabel(action.label)}
        description={getCommandMenuItemLabel(action.description ?? '')}
        to={to}
        onClick={disabled ? undefined : onClick}
        hotKeys={action.hotKeys}
        disabled={disabled}
        RightComponent={disabled ? <Loader /> : undefined}
      />
    </SelectableListItem>
  );
};
