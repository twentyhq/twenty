import { useRef } from 'react';
import { Key } from 'ts-key-enum';

import { SelectableMenuItemSelect } from '@/object-record/relation-picker/components/SelectableMenuItemSelect';
import { IconPlus } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { CreateNewButton } from '../../../ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuSkeletonItem } from '../../../ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { EntityForSelect } from '../types/EntityForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

export type SingleEntitySelectBaseProps = {
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
  emptyCompany?: boolean;
  entitiesInDropdown: EntityForSelect[];
  isInitialAvailableCompanyEmpty?: boolean;
};

export const SingleEntitySelectBase = ({
  EmptyIcon,
  emptyLabel,
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
  emptyCompany,
  entitiesInDropdown,
  isInitialAvailableCompanyEmpty,
}: SingleEntitySelectBaseProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
        {!emptyCompany && !loading && (
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
          </DropdownMenuItemsContainer>
        )}
        {entitiesInDropdown.length === 0 ? null : (
          <DropdownMenuItemsContainer hasMaxHeight>
            {entitiesInDropdown?.map((entity) => (
              <SelectableMenuItemSelect
                key={entity.id}
                entity={entity}
                onEntitySelected={onEntitySelected}
                selectedEntity={selectedEntity}
              />
            ))}
          </DropdownMenuItemsContainer>
        )}
        {showCreateButton ||
          (isInitialAvailableCompanyEmpty && !loading && (
            <>
              <DropdownMenuItemsContainer hasMaxHeight>
                {!emptyCompany && <DropdownMenuSeparator />}
                <CreateNewButton
                  onClick={onCreate}
                  LeftIcon={IconPlus}
                  text="Add New"
                />
              </DropdownMenuItemsContainer>
            </>
          ))}
        {isInitialAvailableCompanyEmpty && !loading && (
          <MenuItem text="No result" />
        )}
      </SelectableList>
    </div>
  );
};
