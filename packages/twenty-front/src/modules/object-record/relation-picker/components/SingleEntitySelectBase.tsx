/* eslint-disable react-hooks/rules-of-hooks */
import { useRef } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { Key } from 'ts-key-enum';

import { IconPlus } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { MenuItemSelectAvatar } from '@/ui/navigation/menu-item/components/MenuItemSelectAvatar';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Avatar } from '@/users/components/Avatar';
import { assertNotNull } from '~/utils/assert';

import { CreateNewButton } from '../../../ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuSkeletonItem } from '../../../ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { CreateButtonId, EmptyButtonId } from '../constants';
import { useEntitySelectScroll } from '../hooks/useEntitySelectScroll';
import { EntityForSelect } from '../types/EntityForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

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
  onCreate?: () => void;
  showCreateButton?: boolean;
  SelectAllIcon?: IconComponent;
  selectAllLabel?: string;
  isAllEntitySelected?: boolean;
  isAllEntitySelectShown?: boolean;
  onAllEntitySelected?: () => void;
};

export const SingleEntitySelectBase = <
  CustomEntityForSelect extends EntityForSelect,
>({
  EmptyIcon,
  emptyLabel,
  entitiesToSelect,
  loading,
  onCancel,
  onEntitySelected,
  selectedEntity,
  onCreate,
  showCreateButton,
  SelectAllIcon,
  selectAllLabel,
  isAllEntitySelected,
  isAllEntitySelectShown,
  onAllEntitySelected,
}: SingleEntitySelectBaseProps<CustomEntityForSelect>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const entitiesInDropdown = [selectedEntity, ...entitiesToSelect].filter(
    (entity): entity is CustomEntityForSelect =>
      assertNotNull(entity) && isNonEmptyString(entity.name),
  );

  const { preselectedOptionId } = useEntitySelectScroll({
    selectableOptionIds: [
      EmptyButtonId,
      ...entitiesInDropdown.map((item) => item.id),
      ...(showCreateButton ? [CreateButtonId] : []),
    ],
    containerRef,
  });

  useScopedHotkeys(
    Key.Escape,
    () => {
      onCancel?.();
    },
    RelationPickerHotkeyScope.RelationPicker,
    [onCancel],
  );

  const selectableItemIds = entitiesInDropdown.map((entity) => entity.id);

  return (
    <div ref={containerRef}>
      <DropdownMenuItemsContainer hasMaxHeight>
        {loading ? (
          <DropdownMenuSkeletonItem />
        ) : entitiesInDropdown.length === 0 && !isAllEntitySelectShown ? (
          <MenuItem text="No result" />
        ) : (
          <>
            {isAllEntitySelectShown &&
              selectAllLabel &&
              onAllEntitySelected && (
                <MenuItemSelect
                  onClick={() => onAllEntitySelected()}
                  LeftIcon={SelectAllIcon}
                  text={selectAllLabel}
                  hovered={preselectedOptionId === EmptyButtonId}
                  selected={!!isAllEntitySelected}
                />
              )}
            {emptyLabel && (
              <MenuItemSelect
                onClick={() => onEntitySelected()}
                LeftIcon={EmptyIcon}
                text={emptyLabel}
                hovered={preselectedOptionId === EmptyButtonId}
                selected={!selectedEntity}
              />
            )}
            {entitiesInDropdown?.map((entity) => (
              <SelectableList
                selectableListId="single-entity-select-base-list"
                selectableItemIds={[selectableItemIds]}
                hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
                onEnter={(_itemId) => {
                  if (
                    showCreateButton &&
                    preselectedOptionId === CreateButtonId
                  ) {
                    onCreate?.();
                  } else {
                    const entity = entitiesInDropdown.findIndex(
                      (entity) => entity.id === _itemId,
                    );
                    onEntitySelected(entitiesInDropdown[entity]);
                  }
                }}
              >
                <SelectableItem itemId={entity.id} key={entity.id}>
                  <MenuItemSelectAvatar
                    key={entity.id}
                    testId="menu-item"
                    onClick={() => onEntitySelected(entity)}
                    text={entity.name}
                    selected={selectedEntity?.id === entity.id}
                    hovered={
                      useSelectableList({
                        selectableListId: 'single-entity-select-base-list',
                        itemId: entity.id,
                      }).isSelectedItemId
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
                  />
                </SelectableItem>
              </SelectableList>
            ))}
          </>
        )}
      </DropdownMenuItemsContainer>
      {showCreateButton && (
        <>
          <DropdownMenuItemsContainer hasMaxHeight>
            <DropdownMenuSeparator />
            <CreateNewButton
              onClick={onCreate}
              LeftIcon={IconPlus}
              text="Add New"
              hovered={preselectedOptionId === CreateButtonId}
            />
          </DropdownMenuItemsContainer>
        </>
      )}
    </div>
  );
};
