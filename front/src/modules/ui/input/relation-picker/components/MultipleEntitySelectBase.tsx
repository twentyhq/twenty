import { useMemo } from 'react';
import { Key } from 'ts-key-enum';

import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemMultiSelectAvatar } from '@/ui/menu-item/components/MenuItemMultiSelectAvatar';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useListenClickOutsideByClassName } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { FiltersHotkeyScope } from '@/ui/view-bar/types/FiltersHotkeyScope';
import { Avatar } from '@/users/components/Avatar';
import { isNonEmptyString } from '~/utils/isNonEmptyString';

import { EntityForSelect } from '../types/EntityForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

export type EntitiesForMultipleEntitySelect<
  CustomEntityForSelect extends EntityForSelect & { isChecked?: boolean },
> = {
  selectedEntities: CustomEntityForSelect[];
  filteredSelectedEntities: CustomEntityForSelect[];
  entitiesToSelect: CustomEntityForSelect[];
  loading: boolean;
};

export const MultipleEntitySelectBase = <
  CustomEntityForSelect extends EntityForSelect,
>({
  entities,
  onChange,
  onCancel,
  onSubmit,
  selectedEntityIds,
}: {
  entities: EntitiesForMultipleEntitySelect<CustomEntityForSelect>;
  onChange: (entityId: string, newCheckedValue: boolean) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  selectedEntityIds: (CustomEntityForSelect & { isChecked: boolean })[];
}) => {
  const entitiesInDropdown = [
    ...(entities.filteredSelectedEntities ?? []),
    ...(entities.entitiesToSelect ?? []),
  ].filter((entity) => isNonEmptyString(entity.name));

  const values = useMemo(
    () =>
      selectedEntityIds.reduce<Record<string, boolean>>(
        (result, entity) => ({ ...result, [entity.id]: entity.isChecked }),
        {},
      ),
    [selectedEntityIds],
  );

  useListenClickOutsideByClassName({
    classNames: ['multi-select-dropdown'],
    callback: () => onSubmit?.(),
  });

  useScopedHotkeys(
    Key.Enter,
    () => onSubmit?.(),
    RelationPickerHotkeyScope.RelationPicker,
    [entitiesInDropdown],
  );

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel?.();
    },
    FiltersHotkeyScope.FilterDropdownButton,
    [onCancel],
  );

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
          selected={!!values[entity.id]}
          onSelectChange={(newCheckedValue) =>
            onChange(entity.id, newCheckedValue)
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
