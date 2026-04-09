import { type CommandMenuItemDisplayProps } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';

export const CommandDropdownItem = ({
  commandMenuItem,
  onClick,
  to,
  disabled = false,
}: {
  commandMenuItem: CommandMenuItemDisplayProps;
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

  const selectableListInstanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    commandMenuItem.key,
    selectableListInstanceId,
  );

  return (
    <SelectableListItem itemId={commandMenuItem.key} onEnter={handleClick}>
      <MenuItem
        focused={isSelectedItemId}
        key={commandMenuItem.key}
        LeftIcon={commandMenuItem.Icon}
        onClick={handleClick}
        text={getCommandMenuItemLabel(commandMenuItem.label)}
        disabled={disabled}
      />
    </SelectableListItem>
  );
};
