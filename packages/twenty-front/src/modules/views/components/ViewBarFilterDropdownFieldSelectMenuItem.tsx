import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown } from '@/views/hooks/useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { objectFilterDropdownIsSelectingRelationTargetFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingRelationTargetFieldComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

export type ViewBarFilterDropdownFieldSelectMenuItemProps = {
  fieldMetadataItemToSelect: FieldMetadataItem;
};

export const ViewBarFilterDropdownFieldSelectMenuItem = ({
  fieldMetadataItemToSelect,
}: ViewBarFilterDropdownFieldSelectMenuItemProps) => {
  const { resetSelectedItem } = useSelectableList(FILTER_FIELD_LIST_ID);

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    fieldMetadataItemToSelect.id,
  );

  const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
    useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItemToSelect.icon);

  const setFieldMetadataItemIdUsedInDropdown = useSetAtomComponentState(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );
  const setObjectFilterDropdownIsSelectingRelationTargetField =
    useSetAtomComponentState(
      objectFilterDropdownIsSelectingRelationTargetFieldComponentState,
    );
  const setObjectFilterDropdownSearchInput = useSetAtomComponentState(
    objectFilterDropdownSearchInputComponentState,
  );

  const handleClick = () => {
    resetSelectedItem();

    if (
      isManyToOneRelationField(fieldMetadataItemToSelect) ||
      isOneToManyRelationField(fieldMetadataItemToSelect)
    ) {
      setFieldMetadataItemIdUsedInDropdown(fieldMetadataItemToSelect.id);
      setObjectFilterDropdownSearchInput('');
      setObjectFilterDropdownIsSelectingRelationTargetField(true);
      return;
    }

    initializeFilterOnFieldMetataItemFromViewBarFilterDropdown(
      fieldMetadataItemToSelect,
    );
  };

  return (
    <SelectableListItem
      itemId={fieldMetadataItemToSelect.id}
      onEnter={handleClick}
    >
      <MenuItem
        focused={isSelectedItemId}
        onClick={handleClick}
        LeftIcon={Icon}
        text={fieldMetadataItemToSelect.label}
        hasSubMenu={
          isManyToOneRelationField(fieldMetadataItemToSelect) ||
          isOneToManyRelationField(fieldMetadataItemToSelect)
        }
      />
    </SelectableListItem>
  );
};
