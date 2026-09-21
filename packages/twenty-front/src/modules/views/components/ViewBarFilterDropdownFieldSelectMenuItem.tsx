import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown } from '@/views/hooks/useInitializeFilterOnFieldMetadataItemFromViewBarFilterDropdown';
import { useIcons } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

export type ViewBarFilterDropdownFieldSelectMenuItemProps = {
  fieldMetadataItemToSelect: FieldMetadataItem;
};

export const ViewBarFilterDropdownFieldSelectMenuItem = ({
  fieldMetadataItemToSelect,
}: ViewBarFilterDropdownFieldSelectMenuItemProps) => {
  const { resetSelectedItem } = useSelectableList();

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
      <ListItem
        focused={isSelectedItemId}
        onClick={getDropdownMenuItemClickHandler(handleClick)}
        startIcon={<SelectOptionIcon Icon={Icon} />}
      >
        <OverflowingTextWithTooltip text={fieldMetadataItemToSelect.label} />
      </ListItem>
    </SelectableListItem>
  );
};
