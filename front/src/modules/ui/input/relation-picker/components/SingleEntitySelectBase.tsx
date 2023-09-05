import { useRef } from 'react';
import { Key } from 'ts-key-enum';

import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { IconBuildingSkyscraper, IconUserCircle } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemSelectAvatar } from '@/ui/menu-item/components/MenuItemSelectAvatar';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Avatar } from '@/users/components/Avatar';
import { isDefined } from '~/utils/isDefined';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { useEntitySelectScroll } from '../hooks/useEntitySelectScroll';
import { EntityForSelect } from '../types/EntityForSelect';
import { Entity } from '../types/EntityTypeForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

import { DropdownMenuSkeletonItem } from './skeletons/DropdownMenuSkeletonItem';

export type EntitiesForSingleEntitySelect<
  CustomEntityForSelect extends EntityForSelect,
> = {
  selectedEntity: CustomEntityForSelect;
  entitiesToSelect: CustomEntityForSelect[];
  loading: boolean;
};

export function SingleEntitySelectBase<
  CustomEntityForSelect extends EntityForSelect,
>({
  entities,
  onEntitySelected,
  onCancel,
  noUser,
}: {
  entities: EntitiesForSingleEntitySelect<CustomEntityForSelect>;
  onEntitySelected: (entity: CustomEntityForSelect | null | undefined) => void;
  onCancel?: () => void;
  noUser?: CustomEntityForSelect;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  let entitiesInDropdown = isDefined(entities.selectedEntity)
    ? [entities.selectedEntity, ...(entities.entitiesToSelect ?? [])]
    : entities.entitiesToSelect ?? [];

  entitiesInDropdown = entitiesInDropdown.filter((entity) =>
    isNonEmptyString(entity.name),
  );

  const { hoveredIndex, resetScroll } = useEntitySelectScroll({
    entities: entitiesInDropdown,
    containerRef,
  });

  useScopedHotkeys(
    Key.Enter,
    () => {
      onEntitySelected(entitiesInDropdown[hoveredIndex]);
      resetScroll();
    },
    RelationPickerHotkeyScope.RelationPicker,
    [entitiesInDropdown, hoveredIndex, onEntitySelected],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel?.();
    },
    RelationPickerHotkeyScope.RelationPicker,
    [onCancel],
  );

  entitiesInDropdown = entitiesInDropdown.filter((entity) =>
    isNonEmptyString(entity.name.trim()),
  );

  const NoUserIcon =
    noUser?.entityType === Entity.User
      ? IconUserCircle
      : IconBuildingSkyscraper;

  return (
    <StyledDropdownMenuItemsContainer ref={containerRef} hasMaxHeight>
      {noUser && (
        <MenuItem
          onClick={() => onEntitySelected(noUser)}
          LeftIcon={NoUserIcon}
          text={noUser.name}
        />
      )}
      {entities.loading ? (
        <DropdownMenuSkeletonItem />
      ) : entitiesInDropdown.length === 0 ? (
        <MenuItem text="No result" />
      ) : (
        entitiesInDropdown?.map((entity) => (
          <MenuItemSelectAvatar
            key={entity.id}
            selected={entities.selectedEntity?.id === entity.id}
            onClick={() => onEntitySelected(entity)}
            text={entity.name}
            hovered={hoveredIndex === entitiesInDropdown.indexOf(entity)}
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
        ))
      )}
    </StyledDropdownMenuItemsContainer>
  );
}
