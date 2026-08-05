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
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { MenuItemSelect } from 'twenty-ui/navigation';

type FieldWidgetNestedFieldDropdownContentProps = {
  drillInFieldMetadataItem: FieldMetadataItem;
  nestedFieldCandidates: FieldMetadataItem[];
  currentFieldMetadataId: string | undefined;
  currentNestedRelationFieldMetadataId: string | null | undefined;
  onBack: () => void;
  onSelectField: (fieldMetadataId: string) => void;
  onSelectNestedField: (
    parentFieldMetadataItem: FieldMetadataItem,
    nestedFieldMetadataItem: FieldMetadataItem,
  ) => void;
};

export const FieldWidgetNestedFieldDropdownContent = ({
  drillInFieldMetadataItem,
  nestedFieldCandidates,
  currentFieldMetadataId,
  currentNestedRelationFieldMetadataId,
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
          <SelectableListItem
            itemId={drillInFieldMetadataItem.id}
            onEnter={() => {
              onSelectField(drillInFieldMetadataItem.id);
            }}
          >
            <MenuItemSelect
              text={drillInFieldMetadataItem.label}
              selected={
                currentFieldMetadataId === drillInFieldMetadataItem.id &&
                !isDefined(currentNestedRelationFieldMetadataId)
              }
              focused={selectedItemId === drillInFieldMetadataItem.id}
              LeftIcon={getIcon(drillInFieldMetadataItem.icon)}
              onClick={() => {
                onSelectField(drillInFieldMetadataItem.id);
              }}
            />
          </SelectableListItem>
          <DropdownMenuSeparator />
          {nestedFieldCandidates.map((nestedFieldMetadataItem) => (
            <SelectableListItem
              key={nestedFieldMetadataItem.id}
              itemId={nestedFieldMetadataItem.id}
              onEnter={() => {
                onSelectNestedField(
                  drillInFieldMetadataItem,
                  nestedFieldMetadataItem,
                );
              }}
            >
              <MenuItemSelect
                text={nestedFieldMetadataItem.label}
                selected={
                  currentFieldMetadataId === drillInFieldMetadataItem.id &&
                  currentNestedRelationFieldMetadataId ===
                    nestedFieldMetadataItem.id
                }
                focused={selectedItemId === nestedFieldMetadataItem.id}
                LeftIcon={getIcon(nestedFieldMetadataItem.icon)}
                onClick={() => {
                  onSelectNestedField(
                    drillInFieldMetadataItem,
                    nestedFieldMetadataItem,
                  );
                }}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </StyledPageLayoutDropdownMenuItemsContainer>
    </StyledPageLayoutDropdownContentContainer>
  );
};
