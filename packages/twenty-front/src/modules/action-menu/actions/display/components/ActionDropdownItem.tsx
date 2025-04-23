import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';

export const ActionDropdownItem = ({
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

  const selectableListInstanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );

  const isSelected = useRecoilComponentFamilyValueV2(
    isSelectedItemIdComponentFamilySelector,
    action.key,
    selectableListInstanceId,
  );

  const { actionMenuType } = useContext(ActionMenuContext);

  const hotkeyScope =
    actionMenuType === 'command-menu-show-page-action-menu-dropdown'
      ? AppHotkeyScope.CommandMenuOpen
      : '';

  return (
    <SelectableListItem
      itemId={action.key}
      hotkeyScope={hotkeyScope}
      onEnter={handleClick}
    >
      <MenuItem
        selected={isSelected}
        key={action.key}
        LeftIcon={action.Icon}
        onClick={handleClick}
        text={getActionLabel(action.label)}
      />
    </SelectableListItem>
  );
};
