import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
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
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';
import { useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown } from '@/views/hooks/useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

const RELATION_RECORD_SELECTABLE_ITEM_ID = 'view-bar-relation-record-select';

export const ViewBarFilterDropdownRelationTargetFieldSelectMenu = () => {
  const sourceFieldMetadataItem = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );
  const setObjectFilterDropdownIsSelectingRelationTargetField =
    useSetAtomComponentState(
      objectFilterDropdownIsSelectingRelationTargetFieldComponentState,
    );
  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    FILTER_FIELD_LIST_ID,
  );
  const { getIcon } = useIcons();
  const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
    useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

  const isTraversableRelation =
    isDefined(sourceFieldMetadataItem) &&
    (isManyToOneRelationField(sourceFieldMetadataItem) ||
      isOneToManyRelationField(sourceFieldMetadataItem));
  const targetObjectMetadataId = isTraversableRelation
    ? sourceFieldMetadataItem.relation.targetObjectMetadata.id
    : null;
  const targetObjectNameSingular = isTraversableRelation
    ? sourceFieldMetadataItem.relation.targetObjectMetadata.nameSingular
    : CoreObjectNameSingular.WorkspaceMember;
  const { objectMetadataItem: targetObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: targetObjectNameSingular,
    });
  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems(
    targetObjectMetadataId ?? '',
  );
  const relationTargetFields = filterableFieldMetadataItems.filter(
    (field) =>
      field.type !== FieldMetadataType.RELATION &&
      field.type !== FieldMetadataType.MORPH_RELATION,
  );

  if (!isTraversableRelation) {
    return null;
  }

  const handleSelectRelationRecord = () => {
    initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
      sourceFieldMetadataItem,
    );
    setObjectFilterDropdownIsSelectingRelationTargetField(false);
  };

  const handleSelectTargetField = (targetField: FieldMetadataItem) => {
    initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
      sourceFieldMetadataItem,
      targetField,
    );
    setObjectFilterDropdownIsSelectingRelationTargetField(false);
  };

  const selectableItemIdArray = [
    RELATION_RECORD_SELECTABLE_ITEM_ID,
    ...relationTargetFields.map((field) => field.id),
  ];

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() =>
              setObjectFilterDropdownIsSelectingRelationTargetField(false)
            }
            Icon={IconChevronLeft}
          />
        }
      >
        {sourceFieldMetadataItem.label}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          focusId={ViewBarFilterDropdownIds.MAIN}
          selectableItemIdArray={selectableItemIdArray}
          selectableListInstanceId={FILTER_FIELD_LIST_ID}
        >
          <SelectableListItem
            itemId={RELATION_RECORD_SELECTABLE_ITEM_ID}
            onEnter={handleSelectRelationRecord}
          >
            <MenuItem
              focused={selectedItemId === RELATION_RECORD_SELECTABLE_ITEM_ID}
              onClick={handleSelectRelationRecord}
              text={targetObjectMetadataItem.labelSingular}
              LeftIcon={getIcon(targetObjectMetadataItem.icon)}
            />
          </SelectableListItem>
          <DropdownMenuSeparator />
          {relationTargetFields.map((targetField) => (
            <SelectableListItem
              itemId={targetField.id}
              key={targetField.id}
              onEnter={() => handleSelectTargetField(targetField)}
            >
              <MenuItem
                focused={selectedItemId === targetField.id}
                onClick={() => handleSelectTargetField(targetField)}
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
