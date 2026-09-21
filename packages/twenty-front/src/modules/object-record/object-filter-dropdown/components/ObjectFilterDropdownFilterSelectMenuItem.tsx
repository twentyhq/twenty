import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
    <ListItem
      focused={isSelectedItemId}
      onClick={getDropdownMenuItemClickHandler(handleClick)}
      startIcon={<SelectOptionIcon Icon={Icon} />}
      hasSubmenu={shouldShowSubMenu}
    >
      <OverflowingTextWithTooltip text={fieldMetadataItemToSelect.label} />
    </ListItem>
  );
};
