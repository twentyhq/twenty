import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterRelationTargetField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterRelationTargetField';
import { usePushFocusForLeafFieldValuePicker } from '@/object-record/advanced-filter/hooks/usePushFocusForLeafFieldValuePicker';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownIsSelectingRelationTargetFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingRelationTargetFieldComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type AdvancedFilterRelationTargetFieldSelectMenuProps = {
  recordFilterId: string;
};

export const AdvancedFilterRelationTargetFieldSelectMenu = ({
  recordFilterId,
}: AdvancedFilterRelationTargetFieldSelectMenuProps) => {
  const { getIcon } = useIcons();

  const sourceFieldMetadataItem = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const setObjectFilterDropdownIsSelectingRelationTargetField =
    useSetAtomComponentState(
      objectFilterDropdownIsSelectingRelationTargetFieldComponentState,
    );

  const { closeAdvancedFilterFieldSelectDropdown } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const { applyAdvancedFilterRelationTargetField } =
    useApplyAdvancedFilterRelationTargetField();

  const { pushFocusForLeafFieldValuePicker } =
    usePushFocusForLeafFieldValuePicker();

  const { advancedFilterFieldSelectDropdownId } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  const targetObjectMetadataId =
    isDefined(sourceFieldMetadataItem) &&
    isManyToOneRelationField(sourceFieldMetadataItem)
      ? sourceFieldMetadataItem.relation.targetObjectMetadata.id
      : null;

  const { filterableFieldMetadataItems: allTargetFields } =
    useFilterableFieldMetadataItems(targetObjectMetadataId ?? '');

  // The backend supports a single hop only. Exclude many-to-one relations
  // from the target list so the user can't compose multi-hop traversals
  // (e.g. Person → Company → ParentCompany) that the dispatcher would
  // collapse back to a filter-by-id on the intermediate relation.
  const relationTargetFields = allTargetFields.filter(
    (field) => !isManyToOneRelationField(field),
  );

  if (
    !isDefined(sourceFieldMetadataItem) ||
    !isManyToOneRelationField(sourceFieldMetadataItem)
  ) {
    return null;
  }

  const handleSubMenuBack = () => {
    setObjectFilterDropdownIsSelectingRelationTargetField(false);
  };

  const handleSelectTargetField = (
    relationTargetFieldMetadataItem: FieldMetadataItem,
  ) => {
    applyAdvancedFilterRelationTargetField({
      sourceFieldMetadataItem,
      relationTargetFieldMetadataItem,
      recordFilterId,
    });

    pushFocusForLeafFieldValuePicker(relationTargetFieldMetadataItem);

    setObjectFilterDropdownIsSelectingRelationTargetField(false);
    closeAdvancedFilterFieldSelectDropdown();
  };

  const selectableItemIdArray = relationTargetFields.map((field) => field.id);

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleSubMenuBack}
            Icon={IconChevronLeft}
          />
        }
      >
        {sourceFieldMetadataItem.label}
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
                handleSelectTargetField(targetField);
              }}
            >
              <MenuItem
                focused={selectedItemId === targetField.id}
                key={`select-filter-relation-${index}`}
                testId={`select-filter-relation-${index}`}
                onClick={() => {
                  handleSelectTargetField(targetField);
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
