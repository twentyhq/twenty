import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeField } from '@/object-record/object-filter-dropdown/utils/isCompositeField';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useRecoilValue } from 'recoil';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { useIcons } from 'twenty-ui/display';

export type ObjectFilterDropdownFilterSelectMenuItemV2Props = {
  fieldMetadataItemToSelect: FieldMetadataItem;
  onClick: (selectedFieldMetadataItem: FieldMetadataItem) => void;
};

export const ObjectFilterDropdownFilterSelectMenuItemV2 = ({
  fieldMetadataItemToSelect,
  onClick,
}: ObjectFilterDropdownFilterSelectMenuItemV2Props) => {
  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    OBJECT_FILTER_DROPDOWN_ID,
  );

  const isSelectedItem = useRecoilValue(
    isSelectedItemIdSelector(fieldMetadataItemToSelect.id),
  );

  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItemToSelect.icon);

  const shouldShowSubMenu = isCompositeField(fieldMetadataItemToSelect.type);

  const handleClick = () => {
    resetSelectedItem();

    onClick(fieldMetadataItemToSelect);
  };

  return (
    <MenuItemSelect
      selected={false}
      hovered={isSelectedItem}
      onClick={handleClick}
      LeftIcon={Icon}
      text={fieldMetadataItemToSelect.label}
      hasSubMenu={shouldShowSubMenu}
    />
  );
};
