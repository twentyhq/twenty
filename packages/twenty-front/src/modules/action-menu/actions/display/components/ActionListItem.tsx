import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useListenToEnterHotkeyOnListItem } from '@/ui/layout/selectable-list/hooks/useListenToEnterHotkeyOnListItem';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';

export const ActionListItem = ({
  action,
  onClick,
  to,
}: {
  action: ActionDisplayProps;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  to?: string;
}) => {
  const navigate = useNavigate();

  useListenToEnterHotkeyOnListItem({
    hotkeyScope: AppHotkeyScope.CommandMenuOpen,
    itemId: action.key,
    onEnter: () => {
      onClick?.();
      if (isNonEmptyString(to)) {
        navigate(to);
      }
    },
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
