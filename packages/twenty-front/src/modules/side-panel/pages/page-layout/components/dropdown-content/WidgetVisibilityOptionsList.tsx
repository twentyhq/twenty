import { VISIBILITY_OPTIONS } from '@/side-panel/pages/page-layout/constants/VisibilityOptions';
import { useVisibilityLabels } from '@/side-panel/pages/page-layout/hooks/useVisibilityLabels';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { MenuItemSelect } from 'twenty-ui/navigation';

type WidgetVisibilityOptionsListProps = {
  currentOptionId: string;
  onSelectVisibility: (optionId: string) => void;
};

export const WidgetVisibilityOptionsList = ({
  currentOptionId,
  onSelectVisibility,
}: WidgetVisibilityOptionsListProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

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
              onSelectVisibility(option.id);
            }}
          >
            <MenuItemSelect
              text={visibilityLabels[option.id]}
              selected={currentOptionId === option.id}
              focused={selectedItemId === option.id}
              onClick={() => {
                onSelectVisibility(option.id);
              }}
            />
          </SelectableListItem>
        ))}
      </SelectableList>
    </DropdownMenuItemsContainer>
  );
};
