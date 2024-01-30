import { useRef } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { Key } from 'ts-key-enum';

import { SelectableMenuItemSelect } from '@/object-record/relation-picker/components/SelectableMenuItemSelect';
import { IconPlus } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { assertNotNull } from '~/utils/assert';

import { EntityForSelect } from '../types/EntityForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

export type SingleEntitySelectMenuItemsProps = {
  EmptyIcon?: IconComponent;
  emptyLabel?: string;
  entitiesToSelect: EntityForSelect[];
  loading?: boolean;
  onCancel?: () => void;
  onEntitySelected: (entity?: EntityForSelect) => void;
  selectedEntity?: EntityForSelect;
  onCreate?: () => void;
  showCreateButton?: boolean;
  SelectAllIcon?: IconComponent;
  selectAllLabel?: string;
  isAllEntitySelected?: boolean;
  isAllEntitySelectShown?: boolean;
  onAllEntitySelected?: () => void;
};

export const SingleEntitySelectMenuItems = ({
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
}: SingleEntitySelectMenuItemsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const entitiesInDropdown = [selectedEntity, ...entitiesToSelect].filter(
    (entity): entity is EntityForSelect =>
      assertNotNull(entity) && isNonEmptyString(entity.name),
  );

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
      <SelectableList
        selectableListId="single-entity-select-base-list"
        selectableItemIdArray={selectableItemIds}
        hotkeyScope={RelationPickerHotkeyScope.RelationPicker}
        onEnter={(itemId) => {
          if (showCreateButton) {
            onCreate?.();
          } else {
            const entity = entitiesInDropdown.findIndex(
              (entity) => entity.id === itemId,
            );
            onEntitySelected(entitiesInDropdown[entity]);
          }
        }}
      >
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
                    key="select-all"
                    onClick={() => onAllEntitySelected()}
                    LeftIcon={SelectAllIcon}
                    text={selectAllLabel}
                    selected={!!isAllEntitySelected}
                  />
                )}
              {emptyLabel && (
                <MenuItemSelect
                  key="select-none"
                  onClick={() => onEntitySelected()}
                  LeftIcon={EmptyIcon}
                  text={emptyLabel}
                  selected={!selectedEntity}
                />
              )}
            </>
          )}
          {entitiesInDropdown?.map((entity) => (
            <SelectableMenuItemSelect
              key={entity.id}
              entity={entity}
              onEntitySelected={onEntitySelected}
              selectedEntity={selectedEntity}
            />
          ))}
          {showCreateButton && !loading && (
            <>
              {entitiesToSelect.length > 0 && <DropdownMenuSeparator />}
              <CreateNewButton
                onClick={onCreate}
                LeftIcon={IconPlus}
                text="Add New"
              />
            </>
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </div>
  );
};
