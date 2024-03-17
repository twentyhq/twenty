import { useRef } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { Key } from 'ts-key-enum';
import {
  CreateNewButton,
  DropdownMenuItemsContainer,
  DropdownMenuSeparator,
  DropdownMenuSkeletonItem,
  IconComponent,
  IconPlus,
  MenuItem,
  MenuItemSelect,
  SelectableList,
} from 'twenty-ui';

import { SelectableMenuItemSelect } from '@/object-record/relation-picker/components/SelectableMenuItemSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from '~/utils/isDefined';

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
      isDefined(entity) && isNonEmptyString(entity.name),
  );

  useScopedHotkeys(
    [Key.Escape],
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
          if (showCreateButton === true) {
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
