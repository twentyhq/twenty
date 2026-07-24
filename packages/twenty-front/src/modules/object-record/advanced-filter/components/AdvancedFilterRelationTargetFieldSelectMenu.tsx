import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useAdvancedFilterFieldSelectDropdown } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldSelectDropdown';
import { useApplyAdvancedFilterRelationTargetField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterRelationTargetField';
import { useApplyAdvancedFilterSourceField } from '@/object-record/advanced-filter/hooks/useApplyAdvancedFilterSourceField';
import { usePushFocusForLeafFieldValuePicker } from '@/object-record/advanced-filter/hooks/usePushFocusForLeafFieldValuePicker';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownIsSelectingRelationTargetFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingRelationTargetFieldComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconUserCircle, useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

const RELATION_RECORD_SELECTABLE_ITEM_ID = 'relation-record-select';

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

  const { applyAdvancedFilterSourceField } =
    useApplyAdvancedFilterSourceField();

  const { pushFocusForLeafFieldValuePicker } =
    usePushFocusForLeafFieldValuePicker();

  const { advancedFilterFieldSelectDropdownId } =
    useAdvancedFilterFieldSelectDropdown(recordFilterId);

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    advancedFilterFieldSelectDropdownId,
  );

  const { objectMetadataItem: workspaceMemberObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });

  const targetObjectMetadataId =
    isDefined(sourceFieldMetadataItem) &&
    isManyToOneRelationField(sourceFieldMetadataItem)
      ? sourceFieldMetadataItem.relation.targetObjectMetadata.id
      : null;

  const { filterableFieldMetadataItems: relationTargetFields } =
    useFilterableFieldMetadataItems(targetObjectMetadataId ?? '');

  if (
    !isDefined(sourceFieldMetadataItem) ||
    !isManyToOneRelationField(sourceFieldMetadataItem)
  ) {
    return null;
  }

  const isWorkspaceMemberTarget =
    sourceFieldMetadataItem.relation.targetObjectMetadata.nameSingular ===
    CoreObjectNameSingular.WorkspaceMember;

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

  const handleSelectRelationRecord = () => {
    applyAdvancedFilterSourceField({
      sourceFieldMetadataItem,
      recordFilterId,
    });

    pushFocusForLeafFieldValuePicker(sourceFieldMetadataItem);

    setObjectFilterDropdownIsSelectingRelationTargetField(false);
    closeAdvancedFilterFieldSelectDropdown();
  };

  const selectableItemIdArray = [
    ...(isWorkspaceMemberTarget ? [RELATION_RECORD_SELECTABLE_ITEM_ID] : []),
    ...relationTargetFields.map((field) => field.id),
  ];

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
          {isWorkspaceMemberTarget && (
            <>
              <SelectableListItem
                itemId={RELATION_RECORD_SELECTABLE_ITEM_ID}
                onEnter={handleSelectRelationRecord}
              >
                <MenuItem
                  focused={
                    selectedItemId === RELATION_RECORD_SELECTABLE_ITEM_ID
                  }
                  testId="select-filter-relation-record"
                  onClick={handleSelectRelationRecord}
                  text={workspaceMemberObjectMetadataItem.labelSingular}
                  LeftIcon={IconUserCircle}
                />
              </SelectableListItem>
              <DropdownMenuSeparator />
            </>
          )}
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
