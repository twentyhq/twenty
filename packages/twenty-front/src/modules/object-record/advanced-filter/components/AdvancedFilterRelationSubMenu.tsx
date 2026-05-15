import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AdvancedFilterRelationSubMenuProps = {
  recordFilterId: string;
  relationFieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataId: string;
  onBack: () => void;
  onSelectTargetField: (params: {
    fieldMetadataItem: FieldMetadataItem;
    relationTargetFieldMetadataItem: FieldMetadataItem;
  }) => void;
};

export const AdvancedFilterRelationSubMenu = ({
  recordFilterId,
  relationFieldMetadataItem,
  targetObjectMetadataId,
  onBack,
  onSelectTargetField,
}: AdvancedFilterRelationSubMenuProps) => {
  const { getIcon } = useIcons();

  const { advancedFilterFieldSelectDropdownId } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  const { filterableFieldMetadataItems: relationTargetFields } =
    useFilterableFieldMetadataItems(targetObjectMetadataId);

  const selectableItemIdArray = relationTargetFields.map((field) => field.id);

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={onBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {relationFieldMetadataItem.label}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          focusId={advancedFilterFieldSelectDropdownId}
          selectableItemIdArray={selectableItemIdArray}
          selectableListInstanceId={advancedFilterFieldSelectDropdownId}
        >
          {relationTargetFields.map((targetField, index) => (
            <SelectableListItem
              itemId={targetField.id}
              key={`select-filter-relation-${index}`}
              onEnter={() => {
                onSelectTargetField({
                  fieldMetadataItem: relationFieldMetadataItem,
                  relationTargetFieldMetadataItem: targetField,
                });
              }}
            >
              <MenuItem
                focused={selectedItemId === targetField.id}
                key={`select-filter-relation-${index}`}
                testId={`select-filter-relation-${index}`}
                onClick={() => {
                  onSelectTargetField({
                    fieldMetadataItem: relationFieldMetadataItem,
                    relationTargetFieldMetadataItem: targetField,
                  });
                }}
                text={targetField.label}
                LeftIcon={getIcon(targetField.icon)}
              />
            </SelectableListItem>
          ))}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
