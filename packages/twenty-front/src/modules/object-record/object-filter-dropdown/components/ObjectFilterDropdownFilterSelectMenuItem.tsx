import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';
import { useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

export type ObjectFilterDropdownFilterSelectMenuItemProps = {
  fieldMetadataItemToSelect: FieldMetadataItem;
  onClick: (selectedFieldMetadataItem: FieldMetadataItem) => void;
};

export const ObjectFilterDropdownFilterSelectMenuItem = ({
  fieldMetadataItemToSelect,
  onClick,
}: ObjectFilterDropdownFilterSelectMenuItemProps) => {
  const { filterFieldListId } = useViewBarFilterDropdownIds();
  const { resetSelectedItem } = useSelectableList(filterFieldListId);

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    fieldMetadataItemToSelect.id,
  );

  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItemToSelect.icon);

  const shouldShowSubMenu =
    isCompositeFieldType(fieldMetadataItemToSelect.type) ||
    isManyToOneRelationField(fieldMetadataItemToSelect);

  const handleClick = () => {
    resetSelectedItem();

    onClick(fieldMetadataItemToSelect);
  };

  return (
    <MenuItem
      focused={isSelectedItemId}
      onClick={handleClick}
      LeftIcon={Icon}
      text={fieldMetadataItemToSelect.label}
      hasSubMenu={shouldShowSubMenu}
    />
  );
};
