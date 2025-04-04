import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { i18n } from '@lingui/core';
import { useContext } from 'react';
import { MenuItem } from 'twenty-ui';

export const ActionDropdownItem = ({
  action,
}: {
  action: ActionDisplayProps;
}) => {
  const { toggleDropdown } = useDropdownV2();
  const actionMenuId = useAvailableComponentInstanceIdOrThrow(
    ActionMenuComponentInstanceContext,
  );
  const { isInRightDrawer } = useContext(ActionMenuContext);

  const dropdownId = isInRightDrawer
    ? getRightDrawerActionMenuDropdownIdFromActionMenuId(actionMenuId)
    : getActionMenuDropdownIdFromActionMenuId(actionMenuId);

  return (
    <MenuItem
      key={action.key}
      LeftIcon={action.Icon}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        toggleDropdown(dropdownId);
        action?.onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      }}
      text={i18n._(action.label)}
    />
  );
};
