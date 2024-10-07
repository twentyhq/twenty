import { isNonEmptyString } from '@sniptt/guards';
import { Fragment, useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconComponent, IconPlus } from 'twenty-ui';

import { SelectableMenuItemSelect } from '@/object-record/relation-picker/components/SelectableMenuItemSelect';
import { SINGLE_ENTITY_SELECT_BASE_LIST } from '@/object-record/relation-picker/constants/SingleEntitySelectBaseList';
import { CreateNewButton } from '@/ui/input/relation-picker/components/CreateNewButton';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
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
  hotkeyScope?: string;
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
  hotkeyScope = RelationPickerHotkeyScope.RelationPicker,
}: SingleEntitySelectMenuItemsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const createNewRecord = showCreateButton
    ? {
        __typename: '',
        id: 'add-new',
        name: 'Add New',
      }
    : null;

  const selectNone = emptyLabel
    ? {
        __typename: '',
        id: 'select-none',
        name: emptyLabel,
      }
    : null;

  const selectAll = isAllEntitySelectShown
    ? {
        __typename: '',
        id: 'select-all',
        name: selectAllLabel,
      }
    : null;

  const entitiesInDropdown = [
    selectAll,
    selectNone,
    selectedEntity,
    ...entitiesToSelect,
    createNewRecord,
  ].filter(
    (entity): entity is EntityForSelect =>
      isDefined(entity) && isNonEmptyString(entity.name),
  );

  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    SINGLE_ENTITY_SELECT_BASE_LIST,
  );

  const isSelectedAddNewButton = useRecoilValue(
    isSelectedItemIdSelector('add-new'),
  );

  const isSelectedSelectNoneButton = useRecoilValue(
    isSelectedItemIdSelector('select-none'),
  );

  const isSelectedSelectAllButton = useRecoilValue(
    isSelectedItemIdSelector('select-all'),
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      resetSelectedItem();
      onCancel?.();
    },
    hotkeyScope,
    [onCancel, resetSelectedItem],
  );

  const selectableItemIds = entitiesInDropdown.map((entity) => entity.id);

  return (
    <div ref={containerRef}>
      <SelectableList
        selectableListId={SINGLE_ENTITY_SELECT_BASE_LIST}
        selectableItemIdArray={selectableItemIds}
        hotkeyScope={hotkeyScope}
        onEnter={(itemId) => {
          if (itemId === 'add-new' && showCreateButton === true) {
            onCreate?.();
          } else {
            const entityIndex = entitiesInDropdown.findIndex(
              (entity) => entity.id === itemId,
            );
            onEntitySelected(entitiesInDropdown[entityIndex]);
          }
          resetSelectedItem();
        }}
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          {loading ? (
            <DropdownMenuSkeletonItem />
          ) : entitiesInDropdown.length === 0 && !isAllEntitySelectShown ? (
            <>
              <MenuItem text="No result" />
              {entitiesToSelect.length > 0 && <DropdownMenuSeparator />}
              <CreateNewButton
                key="add-new"
                onClick={onCreate}
                LeftIcon={IconPlus}
                text="Add New"
                hovered={isSelectedAddNewButton}
              />
            </>
          ) : (
            entitiesInDropdown?.map((entity) => {
              switch (entity.id) {
                case 'add-new': {
                  return (
                    <Fragment key={entity.id}>
                      {entitiesToSelect.length > 0 && <DropdownMenuSeparator />}
                      <CreateNewButton
                        onClick={onCreate}
                        LeftIcon={IconPlus}
                        text="Add New"
                        hovered={isSelectedAddNewButton}
                      />
                    </Fragment>
                  );
                }
                case 'select-none': {
                  return (
                    emptyLabel && (
                      <MenuItemSelect
                        key={entity.id}
                        onClick={() => onEntitySelected()}
                        LeftIcon={EmptyIcon}
                        text={emptyLabel}
                        selected={!selectedEntity}
                        hovered={isSelectedSelectNoneButton}
                      />
                    )
                  );
                }
                case 'select-all': {
                  return (
                    isAllEntitySelectShown &&
                    selectAllLabel &&
                    onAllEntitySelected && (
                      <MenuItemSelect
                        key={entity.id}
                        onClick={() => onAllEntitySelected()}
                        LeftIcon={SelectAllIcon}
                        text={selectAllLabel}
                        selected={!!isAllEntitySelected}
                        hovered={isSelectedSelectAllButton}
                      />
                    )
                  );
                }
                default: {
                  return (
                    <SelectableMenuItemSelect
                      key={entity.id}
                      entity={entity}
                      onEntitySelected={onEntitySelected}
                      selectedEntity={selectedEntity}
                    />
                  );
                }
              }
            })
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </div>
  );
};
