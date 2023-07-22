import { useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Key } from 'ts-key-enum';

import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { useScopedHotkeys } from '@/ui/hotkey/hooks/useScopedHotkeys';
import { Avatar } from '@/users/components/Avatar';
import { isDefined } from '~/utils/isDefined';

import { OverflowingTextWithTooltip } from '../../tooltip/OverflowingTextWithTooltip';
import { useEntitySelectScroll } from '../hooks/useEntitySelectScroll';
import { EntityForSelect } from '../types/EntityForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

import { DropdownMenuItemsContainerSkeleton } from './skeletons/DropdownMenuItemsContainerSkeleton';

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
    <DropdownMenuItemsContainer ref={containerRef} hasMaxHeight>
      {entities.loading ? (
        <DropdownMenuItemsContainerSkeleton>
          <Skeleton height={16} />
        </DropdownMenuItemsContainerSkeleton>
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
              colorId={entity.id}
              placeholder={entity.name}
              size={16}
              type={entity.avatarType ?? 'rounded'}
            />
            <OverflowingTextWithTooltip text={entity.name} />
          </DropdownMenuSelectableItem>
        ))
      )}
    </DropdownMenuItemsContainer>
  );
}
