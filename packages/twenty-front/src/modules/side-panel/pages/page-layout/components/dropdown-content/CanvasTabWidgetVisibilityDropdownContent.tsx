import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { VISIBILITY_OPTIONS } from '@/side-panel/pages/page-layout/constants/VisibilityOptions';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { expressionToOptionId } from '@/side-panel/pages/page-layout/utils/expressionToOptionId';
import { optionIdToExpression } from '@/side-panel/pages/page-layout/utils/optionIdToExpression';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { MenuItemSelect } from 'twenty-ui/navigation';

type CanvasTabWidgetVisibilityDropdownContentProps = {
  widgetId: string;
  currentExpression: string | null | undefined;
  pageLayoutId: string;
};

export const CanvasTabWidgetVisibilityDropdownContent = ({
  widgetId,
  currentExpression,
  pageLayoutId,
}: CanvasTabWidgetVisibilityDropdownContentProps) => {
  const currentOptionId = expressionToOptionId(currentExpression);

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectVisibility = (optionId: string) => {
    updatePageLayoutWidget(widgetId, {
      conditionalAvailabilityExpression: optionIdToExpression(optionId),
    });
    closeDropdown();
  };

  const visibilityLabels = useVisibilityLabels();

  return (
    <DropdownMenuItemsContainer>
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={VISIBILITY_OPTIONS.map((option) => option.id)}
      >
        {VISIBILITY_OPTIONS.map((option) => (
          <SelectableListItem
            key={option.id}
            itemId={option.id}
            onEnter={() => handleSelectVisibility(option.id)}
          >
            <MenuItemSelect
              text={visibilityLabels[option.id] ?? option.id}
              selected={currentOptionId === option.id}
              focused={selectedItemId === option.id}
              onClick={() => handleSelectVisibility(option.id)}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
