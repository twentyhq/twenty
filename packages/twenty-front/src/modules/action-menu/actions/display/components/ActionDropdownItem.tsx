import { ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { getRightDrawerActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getRightDrawerActionMenuDropdownIdFromActionMenuId';
import { useDropdownV2 } from '@/ui/layout/dropdown/hooks/useDropdownV2';
import { i18n } from '@lingui/core';
import { MenuItem } from 'twenty-ui';

export const ActionDropdownItem = ({
  action,
}: {
  action: ActionDisplayProps;
}) => {
  const { toggleDropdown } = useDropdownV2();

  return (
    <MenuItem
      key={action.key}
      LeftIcon={action.Icon}
      onClick={() => {
        toggleDropdown(
          getRightDrawerActionMenuDropdownIdFromActionMenuId(action.key),
        );
      }}
      text={i18n._(action.label)}
    />
  );
};
