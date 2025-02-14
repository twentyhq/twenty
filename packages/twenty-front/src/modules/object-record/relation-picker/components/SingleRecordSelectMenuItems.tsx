import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconComponent, MenuItemSelect } from 'twenty-ui';

import { SelectableMenuItemSelect } from '@/object-record/relation-picker/components/SelectableMenuItemSelect';
import { SINGLE_RECORD_SELECT_BASE_LIST } from '@/object-record/relation-picker/constants/SingleRecordSelectBaseList';
import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from 'twenty-shared';

import { RecordForSelect } from '../types/RecordForSelect';
import { RelationPickerHotkeyScope } from '../types/RelationPickerHotkeyScope';

export type SingleRecordSelectMenuItemsProps = {
  EmptyIcon?: IconComponent;
  emptyLabel?: string;
  recordsToSelect: RecordForSelect[];
  loading?: boolean;
  onCancel?: () => void;
  onRecordSelected: (entity?: RecordForSelect) => void;
  selectedRecord?: RecordForSelect;
  hotkeyScope?: string;
  isFiltered: boolean;
  shouldSelectEmptyOption?: boolean;
};

export const SingleRecordSelectMenuItems = ({
  EmptyIcon,
  emptyLabel,
  recordsToSelect,
  loading,
  onCancel,
  onRecordSelected,
  selectedRecord,
  hotkeyScope = RelationPickerHotkeyScope.RelationPicker,
  isFiltered,
  shouldSelectEmptyOption,
}: SingleRecordSelectMenuItemsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectNone = emptyLabel
    ? {
        __typename: '',
        id: 'select-none',
        name: emptyLabel,
      }
    : null;

  const recordsInDropdown = [
    selectNone,
    selectedRecord,
    ...recordsToSelect,
  ].filter(
    (entity): entity is RecordForSelect =>
      isDefined(entity) && isNonEmptyString(entity.name),
  );

  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    SINGLE_RECORD_SELECT_BASE_LIST,
  );

  const isSelectedSelectNoneButton = useRecoilValue(
    isSelectedItemIdSelector('select-none'),
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

  const selectableItemIds = recordsInDropdown.map((entity) => entity.id);

  return (
    <div ref={containerRef}>
      <SelectableList
        selectableListId={SINGLE_RECORD_SELECT_BASE_LIST}
        selectableItemIdArray={selectableItemIds}
        hotkeyScope={hotkeyScope}
        onEnter={(itemId) => {
          const recordIndex = recordsInDropdown.findIndex(
            (record) => record.id === itemId,
          );
          onRecordSelected(recordsInDropdown[recordIndex]);
          resetSelectedItem();
        }}
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          {loading && !isFiltered ? (
            <DropdownMenuSkeletonItem />
          ) : recordsInDropdown.length === 0 && !loading ? (
            <></>
          ) : (
            recordsInDropdown?.map((record) => {
              switch (record.id) {
                case 'select-none': {
                  return (
                    emptyLabel && (
                      <MenuItemSelect
                        key={record.id}
                        onClick={() => onRecordSelected()}
                        LeftIcon={EmptyIcon}
                        text={emptyLabel}
                        selected={shouldSelectEmptyOption === true}
                        hovered={isSelectedSelectNoneButton}
                      />
                    )
                  );
                }
                default: {
                  return (
                    <SelectableMenuItemSelect
                      key={record.id}
                      record={record}
                      onRecordSelected={onRecordSelected}
                      selectedRecord={selectedRecord}
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
