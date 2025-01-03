import { StyledMultipleSelectDropdownAvatarChip } from '@/object-record/select/components/StyledMultipleSelectDropdownAvatarChip';
import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import styled from '@emotion/styled';
import { MenuItemMultiSelectAvatar } from 'twenty-ui';

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
            avatar={
              <StyledMultipleSelectDropdownAvatarChip
                className="avatar-icon-container"
                name={selectableItem.name}
                avatarUrl={selectableItem.avatarUrl}
                LeftIcon={selectableItem.AvatarIcon}
                avatarType={selectableItem.avatarType}
                isIconInverted={selectableItem.isIconInverted}
                placeholderColorSeed={selectableItem.id}
              />
            }
          />
        );
      })}
    </StyledPinnedItemsContainer>
  );
};
