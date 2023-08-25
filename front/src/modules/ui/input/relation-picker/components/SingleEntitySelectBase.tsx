import { useRef } from 'react';
import { useTheme } from '@emotion/react';
import { Key } from 'ts-key-enum';

import { DropdownMenuItem } from '@/ui/dropdown/components/DropdownMenuItem';
import { DropdownMenuSelectableItem } from '@/ui/dropdown/components/DropdownMenuSelectableItem';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { IconBuildingSkyscraper, IconUserCircle } from '@/ui/icon';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';
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
  const theme = useTheme();

  return (
    <StyledDropdownMenuItemsContainer ref={containerRef} hasMaxHeight>
      {noUser && (
        <DropdownMenuItem onClick={() => onEntitySelected(noUser)}>
          {noUser.entityType === Entity.User ? (
            <IconUserCircle size={theme.icon.size.md} />
          ) : (
            <IconBuildingSkyscraper
              size={theme.icon.size.md}
            ></IconBuildingSkyscraper>
          )}
          {noUser.name}
        </DropdownMenuItem>
      )}
      {entities.loading ? (
        <DropdownMenuSkeletonItem />
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
              size="md"
              type={entity.avatarType ?? 'rounded'}
            />
            <OverflowingTextWithTooltip text={entity.name} />
          </DropdownMenuSelectableItem>
        ))
      )}
    </StyledDropdownMenuItemsContainer>
  );
}
