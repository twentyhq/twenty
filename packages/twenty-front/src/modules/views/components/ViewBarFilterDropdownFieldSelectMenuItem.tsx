import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown } from '@/views/hooks/useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';
import { useIcons } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

export type ViewBarFilterDropdownFieldSelectMenuItemProps = {
  fieldMetadataItemToSelect: FieldMetadataItem;
};

export const ViewBarFilterDropdownFieldSelectMenuItem = ({
  fieldMetadataItemToSelect,
}: ViewBarFilterDropdownFieldSelectMenuItemProps) => {
  const { filterFieldListId } = useViewBarFilterDropdownIds();

  const { resetSelectedItem } = useSelectableList(filterFieldListId);

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    fieldMetadataItemToSelect.id,
  );

  const { initializeFilterOnFieldMetataItemFromViewBarFilterDropdown } =
    useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown();

  const { getIcon } = useIcons();

  const Icon = getIcon(fieldMetadataItemToSelect.icon);

  const handleClick = () => {
    resetSelectedItem();

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
      />
    </SelectableListItem>
  );
};
