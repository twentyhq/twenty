import { isNonEmptyString } from '@sniptt/guards';
import { useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconComponent, MenuItemSelect } from 'twenty-ui';

import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from 'twenty-shared';

import { SingleRecordPickerMenuItem } from '@/object-record/record-picker/components/SingleRecordPickerMenuItem';
import { RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID } from '@/object-record/record-picker/constants/RecordPickerSelectableListComponentInstanceId';
import { RecordPickerHotkeyScope } from '@/object-record/record-picker/types/RecordPickerHotkeyScope';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/types/SingleRecordPickerRecord';

export type SingleRecordPickerMenuItemsProps = {
  EmptyIcon?: IconComponent;
  emptyLabel?: string;
  recordsToSelect: SingleRecordPickerRecord[];
  loading?: boolean;
  onCancel?: () => void;
  onRecordSelected: (entity?: SingleRecordPickerRecord) => void;
  selectedRecord?: SingleRecordPickerRecord;
  hotkeyScope?: string;
  isFiltered: boolean;
  shouldSelectEmptyOption?: boolean;
};

export const SingleRecordPickerMenuItems = ({
  EmptyIcon,
  emptyLabel,
  recordsToSelect,
  loading,
  onCancel,
  onRecordSelected,
  selectedRecord,
  hotkeyScope = RecordPickerHotkeyScope.RecordPicker,
  isFiltered,
  shouldSelectEmptyOption,
}: SingleRecordPickerMenuItemsProps) => {
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
    (entity): entity is SingleRecordPickerRecord =>
      isDefined(entity) && isNonEmptyString(entity.name),
  );

  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID,
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
        selectableListId={RECORD_PICKER_SELECTABLE_LIST_COMPONENT_INSTANCE_ID}
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
                    <SingleRecordPickerMenuItem
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
