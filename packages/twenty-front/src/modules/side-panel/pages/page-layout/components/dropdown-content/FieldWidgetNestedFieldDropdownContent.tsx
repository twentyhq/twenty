import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  StyledPageLayoutDropdownContentContainer,
  StyledPageLayoutDropdownMenuItemsContainer,
} from '@/side-panel/pages/page-layout/components/dropdown-content/PageLayoutDropdownContentContainer';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';

type FieldWidgetNestedFieldDropdownContentProps = {
  drillInFieldMetadataItem: FieldMetadataItem;
  nestedFieldCandidates: FieldMetadataItem[];
  checkedItemId: string | undefined;
  onBack: () => void;
  onSelectField: (fieldMetadataItem: FieldMetadataItem) => void;
  onSelectNestedField: (
    parentFieldMetadataItem: FieldMetadataItem,
    nestedFieldMetadataItem: FieldMetadataItem,
  ) => void;
};

export const FieldWidgetNestedFieldDropdownContent = ({
  drillInFieldMetadataItem,
  nestedFieldCandidates,
  checkedItemId,
  onBack,
  onSelectField,
  onSelectNestedField,
}: FieldWidgetNestedFieldDropdownContentProps) => {
  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { getIcon } = useIcons();

  const renderOption = (
    fieldMetadataItem: FieldMetadataItem,
    onSelect: () => void,
  ) => (
    <SelectableListItem
      key={fieldMetadataItem.id}
      itemId={fieldMetadataItem.id}
      onEnter={onSelect}
    >
      <MenuItemSelect
        text={fieldMetadataItem.label}
        selected={checkedItemId === fieldMetadataItem.id}
        focused={selectedItemId === fieldMetadataItem.id}
        LeftIcon={getIcon(fieldMetadataItem.icon)}
        onClick={onSelect}
      />
    </SelectableListItem>
  );

  return (
    <StyledPageLayoutDropdownContentContainer>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {drillInFieldMetadataItem.label}
      </DropdownMenuHeader>
      <StyledPageLayoutDropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={[
            drillInFieldMetadataItem.id,
            ...nestedFieldCandidates.map((field) => field.id),
          ]}
        >
          {renderOption(drillInFieldMetadataItem, () =>
            onSelectField(drillInFieldMetadataItem),
          )}
          <DropdownMenuSeparator />
          {nestedFieldCandidates.map((nestedFieldMetadataItem) =>
            renderOption(nestedFieldMetadataItem, () =>
              onSelectNestedField(
                drillInFieldMetadataItem,
                nestedFieldMetadataItem,
              ),
            ),
          )}
        </SelectableList>
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
