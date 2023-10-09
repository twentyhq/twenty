import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/menu-item/components/MenuItemMultiSelectAvatar';
import { Avatar } from '@/users/components/Avatar';

import { EntityForSelect } from '../types/EntityForSelect';

export const MultipleEntitySelectBase = <
  CustomEntityForSelect extends EntityForSelect & { isChecked: boolean },
>({
  entitiesInDropdown,
  onChange,
}: {
  entitiesInDropdown: CustomEntityForSelect[];
  onChange: (entity: EntityForSelect, newCheckedValue: boolean) => void;
}) => {
  return (
    <StyledDropdownMenuItemsContainer
      hasMaxHeight
      className="multi-select-dropdown"
    >
      {entitiesInDropdown?.length === 0 && <MenuItem text="No result" />}
      {entitiesInDropdown?.map((entity) => (
        <MenuItemMultiSelectAvatar
          key={entity.id}
          testId="menu-item"
          selected={entity.isChecked}
          onSelectChange={(newCheckedValue) =>
            onChange(entity, newCheckedValue)
          }
          avatar={
            <Avatar
              avatarUrl={entity.avatarUrl}
              colorId={entity.id}
              placeholder={entity.name}
              size="md"
              type={entity.avatarType ?? 'rounded'}
            />
          }
          text={entity.name}
        />
      ))}
    </StyledDropdownMenuItemsContainer>
  );
};
