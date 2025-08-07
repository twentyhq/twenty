import { type ActionDisplayProps } from '@/action-menu/actions/display/components/ActionDisplay';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { isSelectedItemIdComponentFamilySelector } from '@/ui/layout/selectable-list/states/selectors/isSelectedItemIdComponentFamilySelector';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
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

  const isSelected = useRecoilComponentFamilyValue(
    isSelectedItemIdComponentFamilySelector,
    action.key,
    selectableListInstanceId,
  );

  return (
    <SelectableListItem itemId={action.key} onEnter={handleClick}>
      <MenuItem
        focused={isSelected}
        key={action.key}
        LeftIcon={action.Icon}
        onClick={handleClick}
        text={getActionLabel(action.label)}
      />
    </SelectableListItem>
  );
};
