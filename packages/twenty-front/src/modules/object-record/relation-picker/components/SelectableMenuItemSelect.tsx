import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import {
  Avatar,
  MenuItemSelectAvatar,
  SelectableItem,
  useSelectableList,
} from 'twenty-ui';

import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

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
  const { isSelectedItemIdSelector } = useSelectableList(
    'single-entity-select-base-list',
  );

  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector(entity.id));

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
            avatarUrl={getImageAbsoluteURIOrBase64(entity.avatarUrl)}
            entityId={entity.id}
            placeholder={entity.name}
            size="md"
            type={entity.avatarType ?? 'rounded'}
          />
        }
      />
    </StyledSelectableItem>
  );
};
