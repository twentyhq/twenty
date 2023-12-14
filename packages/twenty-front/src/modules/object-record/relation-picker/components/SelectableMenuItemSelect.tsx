import styled from '@emotion/styled';

import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItemSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemSelectAvatar';
import { Avatar } from '@/users/components/Avatar';

type SelectableMenuItemSelectProps = {
  entity: EntityForSelect;
  onEntitySelected: (entitySelected?: EntityForSelect) => void;
  selectedEntity?: EntityForSelect;
};

const StyledSelectableItem = styled(SelectableItem)`
  width: 100%;
`;

export const SelectableMenuItemSelect = ({
  entity,
  onEntitySelected,
  selectedEntity,
}: SelectableMenuItemSelectProps) => {
  const { isSelectedItemId } = useSelectableList({
    selectableListId: 'single-entity-select-base-list',
    itemId: entity.id,
  });

  return (
    <StyledSelectableItem itemId={entity.id} key={entity.id}>
      <MenuItemSelectAvatar
        key={entity.id}
        testId="menu-item"
        onClick={() => onEntitySelected(entity)}
        text={entity.name}
        selected={selectedEntity?.id === entity.id}
        hovered={isSelectedItemId}
        avatar={
          <Avatar
            avatarUrl={entity.avatarUrl}
            colorId={entity.id}
            placeholder={entity.name}
            size="md"
            type={entity.avatarType ?? 'rounded'}
          />
        }
      />
    </StyledSelectableItem>
  );
};
