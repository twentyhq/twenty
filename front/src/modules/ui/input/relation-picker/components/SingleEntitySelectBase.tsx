import { useRef } from 'react';
import { Key } from 'ts-key-enum';

import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import type { IconComponent } from '@/ui/icon/types/IconComponent';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemSelectAvatar } from '@/ui/menu-item/components/MenuItemSelectAvatar';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Avatar } from '@/users/components/Avatar';
import { assertNotNull } from '~/utils/assert';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { useEntitySelectScroll } from '../hooks/useEntitySelectScroll';
import { EntityForSelect } from '../types/EntityForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

import { DropdownMenuSkeletonItem } from './skeletons/DropdownMenuSkeletonItem';

export type SingleEntitySelectBaseProps<
  CustomEntityForSelect extends EntityForSelect,
> = {
  EmptyIcon?: IconComponent;
  emptyLabel?: string;
  entitiesToSelect: CustomEntityForSelect[];
  loading?: boolean;
  onCancel?: () => void;
  onEntitySelected: (entity?: CustomEntityForSelect) => void;
  selectedEntity?: CustomEntityForSelect;
};

export function SingleEntitySelectBase<
  CustomEntityForSelect extends EntityForSelect,
>({
  EmptyIcon,
  emptyLabel,
  entitiesToSelect,
  loading,
  onCancel,
  onEntitySelected,
  selectedEntity,
}: SingleEntitySelectBaseProps<CustomEntityForSelect>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const entitiesInDropdown = [selectedEntity, ...entitiesToSelect].filter(
    (entity): entity is CustomEntityForSelect =>
      assertNotNull(entity) && isNonEmptyString(entity.name.trim()),
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

  return (
    <StyledDropdownMenuItemsContainer ref={containerRef} hasMaxHeight>
      {emptyLabel && (
        <MenuItem
          onClick={() => onEntitySelected()}
          LeftIcon={EmptyIcon}
          text={emptyLabel}
        />
      )}
      {loading ? (
        <DropdownMenuSkeletonItem />
      ) : entitiesInDropdown.length === 0 ? (
        <MenuItem text="No result" />
      ) : (
        entitiesInDropdown?.map((entity) => (
          <MenuItemSelectAvatar
            key={entity.id}
            testId="menu-item"
            selected={selectedEntity?.id === entity.id}
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
