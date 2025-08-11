import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import styled from '@emotion/styled';
import { Avatar } from 'twenty-ui/display';
import { MenuItemMultiSelectAvatar } from 'twenty-ui/navigation';

const StyledPinnedItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)};
`;

export const ObjectFilterDropdownRecordPinnedItems = (props: {
  selectableItems: SelectableItem[];
  onChange: (
    selectableItem: SelectableItem,
    isNewCheckedValue: boolean,
  ) => void;
}) => {
  return (
    <StyledPinnedItemsContainer>
      {props.selectableItems.map((selectableItem) => {
        return (
          <MenuItemMultiSelectAvatar
            key={selectableItem.id}
            selected={selectableItem.isSelected}
            onSelectChange={(newCheckedValue) => {
              props.onChange(selectableItem, newCheckedValue);
            }}
            text={selectableItem.name}
            avatar={
              selectableItem.avatarUrl ? (
                <Avatar
                  avatarUrl={selectableItem.avatarUrl}
                  placeholderColorSeed={selectableItem.id}
                  placeholder={selectableItem.name}
                  type={selectableItem.avatarType}
                  size="md"
                />
              ) : (
                selectableItem.AvatarIcon && (
                  <selectableItem.AvatarIcon size="16" />
                )
              )
            }
          />
        );
      })}
    </StyledPinnedItemsContainer>
  );
};
