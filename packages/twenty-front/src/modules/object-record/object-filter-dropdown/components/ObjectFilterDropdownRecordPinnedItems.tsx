import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const ObjectFilterDropdownRecordPinnedItems = (props: {
  selectableItems: SelectableItem[];
  onChange: (
    selectableItem: SelectableItem,
    isNewCheckedValue: boolean,
  ) => void;
}) => {
  return (
    <DropdownMenuItemsContainer isMultiSelect scrollable={false}>
      {props.selectableItems.map((selectableItem) => {
        return (
          <ListItem
            render={<button type="button" />}
            key={selectableItem.id}
            role="option"
            aria-selected={selectableItem.isSelected}
            selected={selectableItem.isSelected}
            indicator="checkbox"
            onClick={() => {
              props.onChange(selectableItem, !selectableItem.isSelected);
            }}
            startIcon={
              selectableItem.avatarUrl ? (
                <Avatar
                  src={getAbsoluteImageUrl(selectableItem.avatarUrl)}
                  colorSeed={selectableItem.id}
                  name={selectableItem.name}
                  shape={selectableItem.avatarShape}
                  size="md"
                />
              ) : (
                selectableItem.AvatarIcon && (
                  <selectableItem.AvatarIcon size="16" />
                )
              )
            }
          >
            <OverflowingTextWithTooltip text={selectableItem.name} />
          </ListItem>
        );
      })}
    </DropdownMenuItemsContainer>
  );
};
