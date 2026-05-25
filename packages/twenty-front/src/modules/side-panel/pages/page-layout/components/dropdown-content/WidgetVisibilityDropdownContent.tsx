import { VISIBILITY_OPTIONS } from '@/side-panel/pages/page-layout/constants/VisibilityOptions';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
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

export const WidgetVisibilityDropdownContent = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentOptionId = expressionToOptionId(
    widgetInEditMode?.conditionalAvailabilityExpression,
  );

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const handleSelectVisibility = (optionId: string) => {
    updateCurrentWidgetConfig({
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
            onEnter={() => {
              handleSelectVisibility(option.id);
            }}
          >
            <MenuItemSelect
              text={visibilityLabels[option.id]}
              selected={currentOptionId === option.id}
              focused={selectedItemId === option.id}
              onClick={() => {
                handleSelectVisibility(option.id);
              }}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
