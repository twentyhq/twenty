import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableListListenToEnterHotkeyOnItem } from '@/ui/layout/selectable-list/hooks/useSelectableListListenToEnterHotkeyOnItem';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const ActionListItem = ({
  action,
  onClick,
  to,
}: {
  action: ActionDisplayProps;
  onClick?: () => void;
  to?: string;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onClick?.();
    if (isDefined(to)) {
      navigate(to);
    }
  };

  useSelectableListListenToEnterHotkeyOnItem({
    hotkeyScope: AppHotkeyScope.CommandMenuOpen,
    itemId: action.key,
    onEnter: handleClick,
  });

  return (
    <SelectableItem itemId={action.key}>
      <CommandMenuItem
        id={action.key}
        Icon={action.Icon}
        label={getActionLabel(action.label)}
        description={getActionLabel(action.description ?? '')}
        to={to}
        onClick={onClick}
        hotKeys={action.hotKeys}
      />
    </SelectableItem>
  );
};
