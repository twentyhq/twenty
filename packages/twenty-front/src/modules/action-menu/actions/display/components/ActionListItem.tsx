import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useOnSelectableListEnter } from '@/ui/layout/selectable-list/hooks/useOnSelectableListEnter';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';

export const ActionListItem = ({ action }: { action: ActionDisplayProps }) => {
  const navigate = useNavigate();
  useOnSelectableListEnter({
    hotkeyScope: AppHotkeyScope.CommandMenuOpen,
    itemId: action.key,
    onEnter: () => {
      action.onClick?.();
      if (isNonEmptyString(action.to)) {
        navigate(action.to);
      }
    },
  });

  return (
    <SelectableItem itemId={action.key}>
      <CommandMenuItem
        id={action.key}
        Icon={action.Icon}
        label={getActionLabel(action.label)}
        to={action.to}
        onClick={action.onClick}
        hotKeys={action.hotKeys}
      />
    </SelectableItem>
  );
};
