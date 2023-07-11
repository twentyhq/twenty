import { useRef } from 'react';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/hotkeys/hooks/useScopedHotkeys';
import { InternalHotkeysScope } from '@/hotkeys/types/internal/InternalHotkeysScope';
import { EntityForSelect } from '@/relation-picker/types/EntityForSelect';
import { DropdownMenuItem } from '@/ui/components/menu/DropdownMenuItem';
import { DropdownMenuItemContainer } from '@/ui/components/menu/DropdownMenuItemContainer';
import { DropdownMenuSelectableItem } from '@/ui/components/menu/DropdownMenuSelectableItem';
import { Avatar } from '@/users/components/Avatar';
import { isDefined } from '@/utils/type-guards/isDefined';

import { useEntitySelectScroll } from '../hooks/useEntitySelectScroll';

import { CompanyPickerSkeleton } from './skeletons/CompanyPickerSkeleton';
import { DropdownMenuItemContainerSkeleton } from './skeletons/DropdownMenuItemContainerSkeleton';

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
}: {
  entities: EntitiesForSingleEntitySelect<CustomEntityForSelect>;
  onEntitySelected: (entity: CustomEntityForSelect) => void;
  onCancel?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const entitiesInDropdown = isDefined(entities.selectedEntity)
    ? [entities.selectedEntity, ...(entities.entitiesToSelect ?? [])]
    : entities.entitiesToSelect ?? [];

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
    InternalHotkeysScope.RelationPicker,
    [entitiesInDropdown, hoveredIndex, onEntitySelected],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel?.();
    },
    InternalHotkeysScope.RelationPicker,
    [onCancel],
  );

  return (
    <DropdownMenuItemContainer ref={containerRef}>
      {entities.loading ? (
        <DropdownMenuItemContainerSkeleton>
          <CompanyPickerSkeleton count={10} />
        </DropdownMenuItemContainerSkeleton>
      ) : entitiesInDropdown.length === 0 ? (
        <DropdownMenuItem>No result</DropdownMenuItem>
      ) : (
        entitiesInDropdown?.map((entity, index) => (
          <DropdownMenuSelectableItem
            key={entity.id}
            selected={entities.selectedEntity?.id === entity.id}
            hovered={hoveredIndex === index}
            onClick={() => onEntitySelected(entity)}
          >
            <Avatar
              avatarUrl={entity.avatarUrl}
              placeholder={entity.name}
              size={16}
              type={entity.avatarType ?? 'rounded'}
            />
            {entity.name}
          </DropdownMenuSelectableItem>
        ))
      )}
    </DropdownMenuItemContainer>
  );
}
