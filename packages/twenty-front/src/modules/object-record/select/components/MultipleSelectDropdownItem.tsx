import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSelectableListNativeItemRef } from '@/ui/layout/selectable-list/hooks/useSelectableListNativeItemRef';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type MultipleSelectDropdownItemProps = {
  item: SelectableItem;
  focused: boolean;
  onSelect: (item: SelectableItem) => void;
};

export const MultipleSelectDropdownItem = ({
  item,
  focused,
  onSelect,
}: MultipleSelectDropdownItemProps) => {
  const nativeItemRef = useSelectableListNativeItemRef(item.id);
  const handleSelect = () => onSelect(item);

  return (
    <SelectableListItem itemId={item.id} onEnter={handleSelect}>
      <ListItem
        render={<button type="button" />}
        ref={nativeItemRef}
        focused={focused}
        role="option"
        aria-selected={item.isSelected}
        selected={item.isSelected}
        indicator="checkbox"
        onClick={handleSelect}
        startIcon={
          <Avatar
            src={getAbsoluteImageUrl(item.avatarUrl)}
            colorSeed={item.id}
            name={item.name}
            size="md"
            shape={item.avatarShape}
          />
        }
      >
        {item.name}
      </ListItem>
    </SelectableListItem>
  );
};
