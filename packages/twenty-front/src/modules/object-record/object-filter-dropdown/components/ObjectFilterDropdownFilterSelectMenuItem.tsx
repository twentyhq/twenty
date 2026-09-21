import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useIcons } from 'twenty-ui/icon';

export type ObjectFilterDropdownFilterSelectMenuItemProps = {
  fieldMetadataItemToSelect: FieldMetadataItem;
  onClick: (selectedFieldMetadataItem: FieldMetadataItem) => void;
};

export const ObjectFilterDropdownFilterSelectMenuItem = ({
  fieldMetadataItemToSelect,
  onClick,
}: ObjectFilterDropdownFilterSelectMenuItemProps) => {
  const { resetSelectedItem } = useSelectableList();

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
    <DropdownListItem
      focused={isSelectedItemId}
      onClick={handleClick}
      startIcon={<SelectOptionIcon Icon={Icon} />}
      hasSubmenu={shouldShowSubMenu}
    >
      {fieldMetadataItemToSelect.label}
    </DropdownListItem>
  );
};
